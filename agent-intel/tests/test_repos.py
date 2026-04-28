import json


def _seed_overlay(tmp_workspace, overlay):
    (tmp_workspace / "repos.json").write_text(json.dumps(overlay))


def test_repos_list_uses_overlay_when_gh_unavailable(client, tmp_workspace, monkeypatch):
    monkeypatch.setenv("GH_ENABLED", "false")
    _seed_overlay(tmp_workspace, [
        {"name": "foo", "category": "mcp", "featured": True},
        {"name": "bar", "category": "infra", "featured": False},
    ])
    response = client.get("/api/repos")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    names = {r["name"] for r in body}
    assert names == {"foo", "bar"}
    foo = next(r for r in body if r["name"] == "foo")
    assert foo["category"] == "mcp"
    assert foo["featured"] is True


def test_repos_list_returns_empty_when_no_gh_no_overlay(client, tmp_workspace, monkeypatch):
    monkeypatch.setenv("GH_ENABLED", "false")
    response = client.get("/api/repos")
    assert response.status_code == 200
    assert response.json() == []
