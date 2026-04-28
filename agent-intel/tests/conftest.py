from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def tmp_workspace(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Build a fake OpenClaw workspace directory tree under tmp_path.

    Tests that touch server module-level state MUST depend on the `client`
    fixture; never `from server import ...` directly. The reload below is
    what binds the server module to this fixture's env vars, and importing
    constants out-of-band would skip that binding.
    """
    memory = tmp_path / "memory"
    cards = memory / "cards"
    cards.mkdir(parents=True)
    monkeypatch.setenv("MEMORY_DIR", str(memory))
    monkeypatch.setenv("CARDS_DIR", str(cards))
    monkeypatch.setenv("REPOS_OVERLAY", str(tmp_path / "repos.json"))
    monkeypatch.setenv("CODEBASE_OVERLAY", str(tmp_path / "codebase.json"))
    monkeypatch.delenv("OPSDECK_API_KEY", raising=False)
    return tmp_path


@pytest.fixture
def client(tmp_workspace: Path) -> TestClient:
    # Imported inside the fixture so monkeypatch.setenv lands before module init.
    # server.py captures MEMORY_DIR / API_KEY / BIND_HOST at module top, so a
    # reload is required for each test to pick up the per-test env.
    import importlib
    import server
    importlib.reload(server)
    return TestClient(server.app)
