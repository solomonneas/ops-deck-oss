"""Dev Journal API - serves parsed memory markdown files."""
import json
import logging
import os
import re
import socket
import subprocess
import time
from pathlib import Path

import yaml
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)

API_KEY = os.environ.get("OPSDECK_API_KEY")
if not API_KEY:
    logger.warning("OPSDECK_API_KEY is not set. Dev Journal API authentication is disabled.")

BIND_HOST = os.environ.get("BIND_HOST", "127.0.0.1")
MEMORY_DIR = Path(os.environ.get("MEMORY_DIR", "/home/clawdbot/.openclaw/workspace/memory"))
CARDS_DIR = Path(os.environ.get("CARDS_DIR", "/home/clawdbot/.openclaw/workspace/memory/cards"))
REPOS_OVERLAY = Path(os.environ.get("REPOS_OVERLAY", "/home/clawdbot/repos/ops-deck-oss/repos.json"))
REPO_DETAIL_OVERLAY = Path(os.environ.get(
    "REPO_DETAIL_OVERLAY",
    "/home/clawdbot/repos/ops-deck-oss/repos-detail.json",
))
CODEBASE_OVERLAY = Path(os.environ.get(
    "CODEBASE_OVERLAY",
    "/home/clawdbot/repos/ops-deck-oss/codebase.json",
))
GH_CACHE_TTL = int(os.environ.get("GH_CACHE_TTL_SECONDS", "600"))
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}\.md$")
CACHE_TTL_SECONDS = 30
CODE_SEARCH_PORT = int(os.environ.get("CODE_SEARCH_PORT", "5204"))
PROMPT_LIBRARY_PORT = int(os.environ.get("PROMPT_LIBRARY_PORT", "5202"))
_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8005",
    "http://opsdeck.local",
]


def _probe_port(port: int, host: str = "127.0.0.1", timeout: float = 0.2) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


TAG_RULES = [
    (["push", "commit", "repo", "git", "merge", "branch"], "build"),
    (["fix", "bug", "error", "broken", "debug"], "fix"),
    (["research", "evaluate", "compare", "explore", "investigate"], "research"),
    (["strategy", "hr", "exit", "plan", "career", "interview"], "strategy"),
    (["cron", "pm2", "service", "deploy", "systemd", "daemon", "nginx"], "ops"),
]

_entries_cache = {"expires_at": 0.0, "entries": []}
_repos_cache = {"expires_at": 0.0, "data": []}

app = FastAPI(title="Dev Journal API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    token: str | None = Query(default=None),
) -> None:
    if not API_KEY:
        return

    provided_key = x_api_key or token
    if provided_key != API_KEY:
        raise HTTPException(status_code=401, detail="Missing or invalid API key")


def auto_tag(text: str) -> list[str]:
    lower = text.lower()
    tags = []
    for keywords, tag in TAG_RULES:
        if any(kw in lower for kw in keywords):
            tags.append(tag)
    return tags



def append_section(sections: list[dict], heading: str | None, lines: list[str]) -> None:
    if heading is None:
        return

    content = "\n".join(lines).strip()
    sections.append(
        {
            "heading": heading,
            "content": content,
            "tags": auto_tag(f"{heading} {content}"),
        }
    )



def summarize_entry(entry: dict) -> dict:
    tags = sorted({tag for section in entry["sections"] for tag in section["tags"]})
    return {
        "date": entry["date"],
        "title": entry["title"],
        "tags": tags,
        "sectionCount": len(entry["sections"]),
    }



def parse_entry(filepath: Path) -> dict:
    raw = filepath.read_text(encoding="utf-8")
    date_str = filepath.stem
    lines = raw.split("\n")

    title = date_str
    for line in lines:
        if line.startswith("# ") and not line.startswith("## "):
            title = line[2:].strip()
            break

    sections = []
    current_heading = None
    current_lines: list[str] = []

    for line in lines:
        if line.startswith("## "):
            append_section(sections, current_heading, current_lines)
            current_heading = line[3:].strip()
            current_lines = []
        elif current_heading is not None:
            current_lines.append(line)

    append_section(sections, current_heading, current_lines)

    return {
        "date": date_str,
        "title": title,
        "sections": sections,
        "rawMarkdown": raw,
    }



def get_all_entries() -> list[dict]:
    now = time.time()
    if _entries_cache["expires_at"] > now:
        return _entries_cache["entries"]

    if not MEMORY_DIR.exists():
        _entries_cache["entries"] = []
        _entries_cache["expires_at"] = now + CACHE_TTL_SECONDS
        return []

    entries = []
    for f in MEMORY_DIR.iterdir():
        if DATE_PATTERN.match(f.name):
            try:
                entries.append(parse_entry(f))
            except Exception as exc:
                logger.exception("Failed to parse journal entry %s: %s", f, exc)
    entries.sort(key=lambda e: e["date"], reverse=True)
    _entries_cache["entries"] = entries
    _entries_cache["expires_at"] = now + CACHE_TTL_SECONDS
    return entries


SLUG_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def _parse_card(filepath: Path) -> dict:
    text = filepath.read_text(encoding="utf-8")
    frontmatter: dict = {}
    body = text
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            try:
                frontmatter = yaml.safe_load(text[4:end]) or {}
            except yaml.YAMLError:
                frontmatter = {}
            body = text[end + 5 :]
    # Frontmatter values can be bare keys (e.g. `tags:`), which YAML parses to
    # None. Coerce to the documented defaults so downstream consumers don't
    # have to defend against null in fields they expect to be lists/strings.
    return {
        "slug": filepath.stem,
        "topic": frontmatter.get("topic") or filepath.stem,
        "category": frontmatter.get("category") or "",
        "tags": frontmatter.get("tags") or [],
        "body": body,
    }


def _list_cards() -> list[dict]:
    if not CARDS_DIR.exists():
        return []
    cards: list[dict] = []
    for p in sorted(CARDS_DIR.glob("*.md")):
        try:
            cards.append(_parse_card(p))
        except Exception as exc:
            logger.exception("Failed to parse memory card %s: %s", p, exc)
    return [{k: v for k, v in c.items() if k != "body"} for c in cards]


def _get_card(slug: str) -> dict | None:
    if not SLUG_PATTERN.match(slug):
        return None
    target = CARDS_DIR / f"{slug}.md"
    if not target.exists():
        return None
    return _parse_card(target)


GH_REPO_LIST_ARGS = [
    "gh", "repo", "list", "--limit", "200",
    "--json", "name,description,url,visibility,pushedAt,isArchived",
]
GH_NEGATIVE_CACHE_SECONDS = 60


def _load_overlay() -> dict[str, dict]:
    if not REPOS_OVERLAY.exists():
        return {}
    try:
        raw = json.loads(REPOS_OVERLAY.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to parse repos overlay %s: %s", REPOS_OVERLAY, exc)
        return {}
    if not isinstance(raw, list):
        logger.warning("Repos overlay %s root is not a list; ignoring", REPOS_OVERLAY)
        return {}
    return {entry["name"]: entry for entry in raw if isinstance(entry, dict) and "name" in entry}


def _fetch_gh_repos() -> list[dict]:
    # Read GH_ENABLED at call time so tests (and operators flipping the env
    # between requests) don't get pinned to whatever was set at import.
    if os.environ.get("GH_ENABLED", "true").lower() != "true":
        return []
    if _repos_cache["expires_at"] > time.time():
        return _repos_cache["data"]
    try:
        result = subprocess.run(
            GH_REPO_LIST_ARGS,
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode != 0:
            logger.warning(
                "gh repo list failed (rc=%s): %s",
                result.returncode, result.stderr.strip(),
            )
            _repos_cache["data"] = []
            _repos_cache["expires_at"] = time.time() + GH_NEGATIVE_CACHE_SECONDS
            return []
        data = json.loads(result.stdout)
    except (FileNotFoundError, subprocess.TimeoutExpired, json.JSONDecodeError) as exc:
        # Negative-cache transient/persistent failures so a broken `gh` (auth
        # expired, missing binary, network down) doesn't spawn a subprocess
        # storm under a polling UI.
        logger.warning("gh repo list errored (%s): %s", type(exc).__name__, exc)
        _repos_cache["data"] = []
        _repos_cache["expires_at"] = time.time() + GH_NEGATIVE_CACHE_SECONDS
        return []
    _repos_cache["data"] = data
    _repos_cache["expires_at"] = time.time() + GH_CACHE_TTL
    return data


def _merge_repos() -> list[dict]:
    """Merge gh data with overlay annotations.

    gh is the source of truth for facts (description, url, visibility,
    pushedAt, isArchived). The overlay is the source of truth for annotations
    (category, featured) AND for repos gh doesn't see (private clones, repos
    on different remotes). Overlay-only entries get all fields from overlay;
    gh-matched entries only have category/featured overridden.
    """
    overlay = _load_overlay()
    gh_data = _fetch_gh_repos()
    by_name: dict[str, dict] = {}
    for entry in gh_data:
        name = entry["name"]
        by_name[name] = {
            "name": name,
            "description": entry.get("description") or "",
            "url": entry.get("url") or "",
            "visibility": entry.get("visibility") or "PUBLIC",
            "pushedAt": entry.get("pushedAt") or "",
            "isArchived": entry.get("isArchived", False),
            "category": "",
            "featured": False,
        }
    for name, ov in overlay.items():
        if name not in by_name:
            by_name[name] = {
                "name": name,
                "description": ov.get("description", ""),
                "url": ov.get("url", ""),
                "visibility": ov.get("visibility", "PUBLIC"),
                "pushedAt": ov.get("pushedAt", ""),
                "isArchived": ov.get("isArchived", False),
                "category": ov.get("category", ""),
                "featured": ov.get("featured", False),
            }
        else:
            by_name[name]["category"] = ov.get("category", by_name[name]["category"])
            by_name[name]["featured"] = ov.get("featured", by_name[name]["featured"])
    return sorted(by_name.values(), key=lambda r: r["name"])


def _load_repo_detail(slug: str) -> dict | None:
    # Slug validation lives in the helper (matches _get_card precedent) so the
    # helper is safe to call from anywhere, not just from a pre-validated route.
    if not SLUG_PATTERN.match(slug):
        return None
    # Read overlay path at call time so tests can re-point it via monkeypatch
    # without forcing a server reload, matching the GH_ENABLED pattern. Falls
    # back to module-level REPO_DETAIL_OVERLAY otherwise.
    overlay_path = Path(os.environ.get("REPO_DETAIL_OVERLAY", str(REPO_DETAIL_OVERLAY)))
    if not overlay_path.exists():
        return None
    try:
        raw = json.loads(overlay_path.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to parse repo detail overlay %s: %s", overlay_path, exc)
        return None
    if not isinstance(raw, dict):
        logger.warning("Repo detail overlay %s root is not a dict; ignoring", overlay_path)
        return None
    entry = raw.get(slug)
    if not isinstance(entry, dict):
        return None
    return entry


def _load_codebase() -> list[dict]:
    # Read overlay path at call time so tests can re-point it via monkeypatch
    # without forcing a server reload, matching the established pattern.
    overlay_path = Path(os.environ.get("CODEBASE_OVERLAY", str(CODEBASE_OVERLAY)))
    if not overlay_path.exists():
        return []
    try:
        raw = json.loads(overlay_path.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Failed to parse codebase overlay %s: %s", overlay_path, exc)
        return []
    if not isinstance(raw, list):
        logger.warning("Codebase overlay %s root is not a list; ignoring", overlay_path)
        return []
    return [entry for entry in raw if isinstance(entry, dict)]


@app.get("/api/entries")
def list_entries(_auth: None = Depends(require_api_key)):
    return get_all_entries()


@app.get("/api/entries/{date}")
def get_entry(date: str, _auth: None = Depends(require_api_key)):
    if not DATE_PATTERN.match(f"{date}.md"):
        raise HTTPException(status_code=400, detail="Date must be in YYYY-MM-DD format")

    filepath = MEMORY_DIR / f"{date}.md"
    if not filepath.exists():
        raise HTTPException(404, "Entry not found")

    try:
        return parse_entry(filepath)
    except Exception as exc:
        logger.exception("Failed to parse journal entry %s: %s", filepath, exc)
        raise HTTPException(status_code=500, detail="Failed to parse journal entry") from exc


@app.get("/api/memory-cards")
def list_memory_cards(_auth: None = Depends(require_api_key)):
    return _list_cards()


@app.get("/api/memory-cards/{slug}")
def get_memory_card(slug: str, _auth: None = Depends(require_api_key)):
    card = _get_card(slug)
    if card is None:
        raise HTTPException(status_code=404, detail="card not found")
    return card


@app.get("/api/repos")
def list_repos(_auth: None = Depends(require_api_key)):
    return _merge_repos()


@app.get("/api/repos/{slug}")
def get_repo_detail(slug: str, _auth: None = Depends(require_api_key)):
    detail = _load_repo_detail(slug)
    if detail is None:
        raise HTTPException(status_code=404, detail="repo detail not found")
    return detail


@app.get("/api/codebase")
def list_codebase(_auth: None = Depends(require_api_key)):
    return _load_codebase()


@app.get("/api/health")
def health():
    entry_count = 0
    if MEMORY_DIR.exists():
        entry_count = sum(1 for f in MEMORY_DIR.iterdir() if DATE_PATTERN.match(f.name))
    return {"status": "ok", "entryCount": entry_count}


@app.get("/healthz")
def healthz():
    """Unauthenticated boot probe for the UI adapter selector.

    Returns reachability of optional ops-deck-lite services. Mirrors
    /api/health's no-auth posture - both must be reachable before the UI has
    any credential to send.
    """
    return {
        "ok": True,
        "capabilities": {
            "journal": True,
            "memory": True,
            "repos": True,
            "codebase": True,
            "search": _probe_port(CODE_SEARCH_PORT),
            "prompts": _probe_port(PROMPT_LIBRARY_PORT),
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=BIND_HOST, port=5206)
