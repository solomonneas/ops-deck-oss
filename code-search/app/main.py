from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error, request

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

APP_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.getenv("CODE_SEARCH_DB_PATH", APP_ROOT / "data" / "runtime" / "code_search.db"))
CORPUS_DIR = Path(os.getenv("CODE_SEARCH_CORPUS_DIR", APP_ROOT / "data" / "corpus"))
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3-embedding:8b")

app = FastAPI(title="ops-deck-code-search")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str
    mode: str = Field(default="hybrid")
    limit: int = Field(default=5, ge=1, le=25)


def ensure_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              path TEXT UNIQUE NOT NULL,
              title TEXT NOT NULL,
              content TEXT NOT NULL,
              content_hash TEXT NOT NULL,
              embedding TEXT,
              indexed_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def tokenize(text: str) -> list[str]:
    return [token for token in "".join(ch.lower() if ch.isalnum() else " " for ch in text).split() if token]


def lexical_score(query: str, content: str) -> float:
    query_tokens = tokenize(query)
    if not query_tokens:
        return 0.0
    content_tokens = tokenize(content)
    if not content_tokens:
        return 0.0
    matches = sum(content_tokens.count(token) for token in query_tokens)
    density = matches / len(content_tokens)
    return matches + density


def fallback_embedding(text: str) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    return [round(byte / 255, 4) for byte in digest[:24]]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    numerator = sum(a * b for a, b in zip(left, right))
    left_norm = sum(a * a for a in left) ** 0.5
    right_norm = sum(b * b for b in right) ** 0.5
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return numerator / (left_norm * right_norm)


def request_ollama_embedding(text: str) -> tuple[list[float], bool]:
    payload = json.dumps({"model": OLLAMA_MODEL, "input": text}).encode("utf-8")
    req = request.Request(
        f"{OLLAMA_BASE_URL}/api/embed",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
            embeddings = data.get("embeddings") or []
            if embeddings and isinstance(embeddings[0], list):
                return embeddings[0], True
    except (error.URLError, TimeoutError, json.JSONDecodeError, KeyError):
        pass
    return fallback_embedding(text), False


def iter_corpus_files() -> list[Path]:
    files: list[Path] = []
    for suffix in ("*.md", "*.txt", "*.json"):
        files.extend(CORPUS_DIR.rglob(suffix))
    return sorted(files)


def index_corpus() -> dict[str, Any]:
    ensure_db()
    indexed = 0
    using_ollama = False
    with sqlite3.connect(DB_PATH) as conn:
        for file_path in iter_corpus_files():
            content = file_path.read_text(encoding="utf-8")
            content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
            row = conn.execute("SELECT content_hash FROM documents WHERE path = ?", (str(file_path.relative_to(CORPUS_DIR)),)).fetchone()
            if row and row[0] == content_hash:
                continue
            embedding, live = request_ollama_embedding(content)
            using_ollama = using_ollama or live
            conn.execute(
                """
                INSERT INTO documents (path, title, content, content_hash, embedding, indexed_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(path) DO UPDATE SET
                  title = excluded.title,
                  content = excluded.content,
                  content_hash = excluded.content_hash,
                  embedding = excluded.embedding,
                  indexed_at = excluded.indexed_at
                """,
                (
                    str(file_path.relative_to(CORPUS_DIR)),
                    file_path.stem.replace("-", " ").title(),
                    content,
                    content_hash,
                    json.dumps(embedding),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            indexed += 1
        conn.commit()
        total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    return {"indexed": indexed, "total": total, "embeddingProvider": "ollama" if using_ollama else "fallback"}


@app.on_event("startup")
def startup() -> None:
    ensure_db()
    index_corpus()


@app.get("/api/health")
def health() -> dict[str, Any]:
    ensure_db()
    with sqlite3.connect(DB_PATH) as conn:
        total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    return {"status": "ok", "service": "code-search", "documents": total, "model": OLLAMA_MODEL}


@app.post("/api/index")
def index() -> dict[str, Any]:
    return index_corpus()


@app.post("/api/search")
def search(payload: SearchRequest) -> dict[str, Any]:
    ensure_db()
    query_embedding, used_ollama = request_ollama_embedding(payload.query)
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute("SELECT path, title, content, embedding, indexed_at FROM documents").fetchall()

    scored = []
    for path_value, title, content, embedding_json, indexed_at in rows:
        lexical = lexical_score(payload.query, content)
        semantic = cosine_similarity(query_embedding, json.loads(embedding_json or "[]"))
        if payload.mode == "lexical":
            score = lexical
        elif payload.mode == "semantic":
            score = semantic
        else:
            score = lexical * 0.6 + semantic * 4
        if score <= 0:
            continue
        snippet_start = content.lower().find(payload.query.lower())
        if snippet_start < 0:
            snippet_start = 0
        snippet = content[snippet_start:snippet_start + 220].strip().replace("\n", " ")
        scored.append(
            {
                "path": path_value,
                "title": title,
                "snippet": snippet,
                "score": round(score, 4),
                "lexicalScore": round(lexical, 4),
                "semanticScore": round(semantic, 4),
                "indexedAt": indexed_at,
            }
        )

    results = sorted(scored, key=lambda item: item["score"], reverse=True)[: payload.limit]
    return {
        "query": payload.query,
        "mode": payload.mode,
        "embeddingProvider": "ollama" if used_ollama else "fallback",
        "results": results,
    }
