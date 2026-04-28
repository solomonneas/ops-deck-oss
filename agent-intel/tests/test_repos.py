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


def test_repos_merges_gh_with_overlay_annotations(client, tmp_workspace, monkeypatch):
    # Mock subprocess.run to simulate a successful `gh repo list` call.
    # Overlay annotates one of the gh repos and adds an overlay-only repo.
    import subprocess
    import server

    fake_gh_output = json.dumps([
        {"name": "alpha", "description": "Alpha repo", "url": "https://github.com/x/alpha",
         "visibility": "PUBLIC", "pushedAt": "2026-04-01T00:00:00Z", "isArchived": False},
        {"name": "beta", "description": None, "url": "https://github.com/x/beta",
         "visibility": "PRIVATE", "pushedAt": "2026-04-02T00:00:00Z", "isArchived": True},
    ])

    def fake_run(args, capture_output, text, timeout):
        assert args[0] == "gh"  # confirm subprocess shape unchanged
        return subprocess.CompletedProcess(args, 0, stdout=fake_gh_output, stderr="")

    monkeypatch.setenv("GH_ENABLED", "true")
    monkeypatch.setattr(server.subprocess, "run", fake_run)
    _seed_overlay(tmp_workspace, [
        {"name": "alpha", "category": "mcp", "featured": True},  # annotates a gh repo
        {"name": "private-only", "category": "infra", "url": "ssh://internal/private-only"},
    ])

    response = client.get("/api/repos")
    assert response.status_code == 200
    body = response.json()
    by_name = {r["name"]: r for r in body}
    assert set(by_name) == {"alpha", "beta", "private-only"}

    # gh-matched + overlay annotation: facts from gh, annotations from overlay.
    alpha = by_name["alpha"]
    assert alpha["description"] == "Alpha repo"  # from gh
    assert alpha["category"] == "mcp"  # from overlay
    assert alpha["featured"] is True  # from overlay

    # gh-only (no overlay match): null description coerced to "", no annotations.
    beta = by_name["beta"]
    assert beta["description"] == ""
    assert beta["isArchived"] is True
    assert beta["category"] == ""
    assert beta["featured"] is False

    # overlay-only: all fields from overlay, defaults filled in.
    priv = by_name["private-only"]
    assert priv["category"] == "infra"
    assert priv["url"] == "ssh://internal/private-only"


def test_repos_negative_caches_when_gh_missing(client, tmp_workspace, monkeypatch):
    # When `gh` is not installed (FileNotFoundError), the failure must be
    # negative-cached so a polling UI doesn't spawn a subprocess storm.
    import server

    call_count = {"n": 0}

    def fake_run(*args, **kwargs):
        call_count["n"] += 1
        raise FileNotFoundError("gh: command not found")

    monkeypatch.setenv("GH_ENABLED", "true")
    monkeypatch.setattr(server.subprocess, "run", fake_run)

    # Two calls back-to-back: the first hits subprocess, the second is served
    # from the negative cache without re-running.
    r1 = client.get("/api/repos")
    r2 = client.get("/api/repos")
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json() == [] and r2.json() == []
    assert call_count["n"] == 1, "second call should be served from negative cache"
