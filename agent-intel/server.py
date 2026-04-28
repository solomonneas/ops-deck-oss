"""Dev Journal API - serves parsed memory markdown files."""
import logging
import os
import re
import socket
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



def invalidate_entries_cache() -> None:
    _entries_cache["entries"] = []
    _entries_cache["expires_at"] = 0.0



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


def _parse_card(filepath: Path) -> dict:
    text = filepath.read_text()
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
    return {
        "slug": filepath.stem,
        "topic": frontmatter.get("topic", filepath.stem),
        "category": frontmatter.get("category", ""),
        "tags": frontmatter.get("tags", []),
        "body": body,
    }


def _list_cards() -> list[dict]:
    if not CARDS_DIR.exists():
        return []
    cards = [_parse_card(p) for p in sorted(CARDS_DIR.glob("*.md"))]
    return [{k: v for k, v in c.items() if k != "body"} for c in cards]


def _get_card(slug: str) -> dict | None:
    target = CARDS_DIR / f"{slug}.md"
    if not target.exists():
        return None
    return _parse_card(target)


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


@app.post("/api/cache/invalidate")
def invalidate_cache(_auth: None = Depends(require_api_key)):
    invalidate_entries_cache()
    return {"status": "ok"}


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
