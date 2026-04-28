def test_memory_cards_empty_workspace_returns_empty_list(client):
    response = client.get("/api/memory-cards")
    assert response.status_code == 200
    assert response.json() == []


def test_memory_cards_lists_seeded_cards(client, tmp_workspace):
    cards_dir = tmp_workspace / "memory" / "cards"
    (cards_dir / "alpha.md").write_text(
        "---\ntopic: Alpha card\ncategory: tools\ntags: [a, b]\n---\nBody text.\n"
    )
    (cards_dir / "beta.md").write_text(
        "---\ntopic: Beta card\ncategory: infra\ntags: [c]\n---\nMore body.\n"
    )
    response = client.get("/api/memory-cards")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 2
    slugs = {card["slug"] for card in body}
    assert slugs == {"alpha", "beta"}
    alpha = next(c for c in body if c["slug"] == "alpha")
    assert alpha["topic"] == "Alpha card"
    assert alpha["category"] == "tools"
    assert alpha["tags"] == ["a", "b"]


def test_memory_card_detail_returns_body(client, tmp_workspace):
    cards_dir = tmp_workspace / "memory" / "cards"
    (cards_dir / "gamma.md").write_text(
        "---\ntopic: Gamma\n---\n# Gamma\nBody paragraph.\n"
    )
    response = client.get("/api/memory-cards/gamma")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "gamma"
    assert "Body paragraph." in body["body"]


def test_memory_card_detail_returns_404_for_missing_slug(client, tmp_workspace):
    response = client.get("/api/memory-cards/does-not-exist")
    assert response.status_code == 404
