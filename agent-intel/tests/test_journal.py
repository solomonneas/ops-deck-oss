def test_health_returns_ok(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_entries_empty_workspace_returns_empty_list(client, tmp_workspace):
    # No daily files seeded; should return an empty list, not crash.
    response = client.get("/api/entries")
    assert response.status_code == 200
    assert response.json() == []


def test_entries_lists_seeded_daily_files(client, tmp_workspace):
    daily = tmp_workspace / "memory" / "2026-04-28.md"
    daily.write_text("## 09:00 - First task\nDid the thing.\n")
    response = client.get("/api/entries")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["date"] == "2026-04-28"
