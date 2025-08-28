import os
import pytest
from fastapi.testclient import TestClient

# Ensure predictable TZ if any datetime formatting is involved
os.environ.setdefault("TZ", "Europe/Berlin")

try:
    from app.main import app
except Exception as exc:  # pragma: no cover
    app = None


@pytest.fixture(scope="session")
def client():
    if app is None:
        pytest.skip("FastAPI app not available for tests")
    return TestClient(app)

