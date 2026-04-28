import json


def test_repo_detail_returns_overlay_entry(client, tmp_workspace, monkeypatch):
    overlay_path = tmp_workspace / "repos-detail.json"
    monkeypatch.setenv("REPO_DETAIL_OVERLAY", str(overlay_path))
    overlay_path.write_text(json.dumps({
        "foo": {
            "name": "foo",
            "summary": "Foo project summary",
            "tech": ["python", "fastapi"],
            "diagrams": [],
        },
    }))
    response = client.get("/api/repos/foo")
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "foo"
    assert body["summary"] == "Foo project summary"
    assert body["tech"] == ["python", "fastapi"]


def test_repo_detail_returns_404_for_missing_slug(client, tmp_workspace, monkeypatch):
    overlay_path = tmp_workspace / "repos-detail.json"
    monkeypatch.setenv("REPO_DETAIL_OVERLAY", str(overlay_path))
    overlay_path.write_text("{}")
    response = client.get("/api/repos/missing")
    assert response.status_code == 404


def test_repo_detail_rejects_path_traversal(client, tmp_workspace, monkeypatch):
    # Slug must not be able to escape via path traversal sequences; the
    # SLUG_PATTERN regex shared with the memory-cards route must reject them
    # before any filesystem read happens.
    overlay_path = tmp_workspace / "repos-detail.json"
    monkeypatch.setenv("REPO_DETAIL_OVERLAY", str(overlay_path))
    overlay_path.write_text("{}")
    response = client.get("/api/repos/..%2F..%2Fetc%2Fpasswd")
    assert response.status_code == 404


def test_repos_list_route_unaffected_by_detail_route(client, tmp_workspace, monkeypatch):
    # Sanity check the route ordering caveat: registering /api/repos/{slug}
    # after /api/repos must not shadow the list route.
    monkeypatch.setenv("GH_ENABLED", "false")
    (tmp_workspace / "repos.json").write_text(json.dumps([
        {"name": "foo", "category": "mcp", "featured": True},
    ]))
    response = client.get("/api/repos")
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    assert any(r["name"] == "foo" for r in body)


def test_repo_detail_404_when_overlay_missing(client, tmp_workspace, monkeypatch):
    # No overlay file at all; route must 404 cleanly without crashing on the
    # missing-file branch.
    monkeypatch.setenv("REPO_DETAIL_OVERLAY", str(tmp_workspace / "nope.json"))
    response = client.get("/api/repos/foo")
    assert response.status_code == 404


def test_repo_detail_404_on_malformed_json(client, tmp_workspace, monkeypatch):
    # Malformed JSON triggers JSONDecodeError; helper must log and return None
    # so the route surfaces a 404 rather than a 500.
    overlay_path = tmp_workspace / "repos-detail.json"
    monkeypatch.setenv("REPO_DETAIL_OVERLAY", str(overlay_path))
    overlay_path.write_text("not valid json {{{")
    response = client.get("/api/repos/foo")
    assert response.status_code == 404
