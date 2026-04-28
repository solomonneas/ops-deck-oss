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


def test_memory_card_bare_yaml_keys_coerce_to_defaults(client, tmp_workspace):
    # Real workspace cards have bare `tags:` lines, which YAML parses to None.
    # The route must coerce None → [] (and same for empty topic/category)
    # so consumers don't have to defend against null in fields they expect
    # to be lists or strings.
    cards_dir = tmp_workspace / "memory" / "cards"
    (cards_dir / "bare.md").write_text(
        "---\ntopic:\ncategory:\ntags:\n---\nBody.\n"
    )
    list_resp = client.get("/api/memory-cards")
    assert list_resp.status_code == 200
    bare = next(c for c in list_resp.json() if c["slug"] == "bare")
    assert bare["topic"] == "bare"  # falls back to slug
    assert bare["category"] == ""
    assert bare["tags"] == []

    detail_resp = client.get("/api/memory-cards/bare")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["tags"] == []


def test_memory_card_detail_rejects_path_traversal(client, tmp_workspace):
    # Slug must not be able to escape CARDS_DIR.
    response = client.get("/api/memory-cards/..%2F..%2Fetc%2Fpasswd")
    assert response.status_code == 404
