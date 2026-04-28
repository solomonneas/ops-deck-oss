import json


def test_codebase_returns_overlay_entries(client, tmp_workspace, monkeypatch):
    overlay = tmp_workspace / "codebase.json"
    monkeypatch.setenv("CODEBASE_OVERLAY", str(overlay))
    overlay.write_text(json.dumps([
        {"path": "src/foo.py", "summary": "Does foo", "language": "python"},
        {"path": "src/bar.ts", "summary": "Does bar", "language": "typescript"},
    ]))
    response = client.get("/api/codebase")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    assert body[0]["path"] == "src/foo.py"


def test_codebase_returns_empty_when_overlay_missing(client, tmp_workspace, monkeypatch):
    monkeypatch.setenv("CODEBASE_OVERLAY", str(tmp_workspace / "missing.json"))
    response = client.get("/api/codebase")
    assert response.status_code == 200
    assert response.json() == []


def test_codebase_returns_empty_on_malformed_json(client, tmp_workspace, monkeypatch):
    overlay = tmp_workspace / "codebase.json"
    monkeypatch.setenv("CODEBASE_OVERLAY", str(overlay))
    overlay.write_text("not json {{{")
    response = client.get("/api/codebase")
    assert response.status_code == 200
    assert response.json() == []


def test_codebase_returns_empty_when_root_not_list(client, tmp_workspace, monkeypatch):
    overlay = tmp_workspace / "codebase.json"
    monkeypatch.setenv("CODEBASE_OVERLAY", str(overlay))
    overlay.write_text(json.dumps({"not": "a list"}))
    response = client.get("/api/codebase")
    assert response.status_code == 200
    assert response.json() == []
