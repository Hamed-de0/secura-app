import pytest


def test_root_health(client):
    """Ping app root; ensure JSON with a message or at least 200."""
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "message" in data or data != {}


@pytest.mark.parametrize("path", ["/docs", "/redoc"])  # docs are optional but usually enabled
def test_docs_endpoints(client, path):
    r = client.get(path)
    # Accept 200 (available) or 404 (disabled)
    assert r.status_code in (200, 404)

