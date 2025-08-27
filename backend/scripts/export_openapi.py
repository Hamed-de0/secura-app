#!/usr/bin/env python3
"""
Export the FastAPI OpenAPI schema to the frontend.

Usage:
  python3 backend/scripts/export_openapi.py [OUTPUT_PATH]

If OUTPUT_PATH is omitted, defaults to
  frontend/src/api/openapi.json relative to the repo root.

Tries to import the FastAPI app (no server needed). If imports fail
(e.g., missing deps), falls back to fetching from http://127.0.0.1:8001/openapi.json.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


def resolve_paths() -> tuple[Path, Path]:
    # scripts/ -> backend/ -> repo root
    script_path = Path(__file__).resolve()
    backend_dir = script_path.parents[1]
    repo_root = backend_dir.parent
    return repo_root, backend_dir


def try_load_openapi_via_import(backend_dir: Path):
    sys.path.insert(0, str(backend_dir))
    try:
        from app.main import app  # type: ignore
        openapi = app.openapi()  # type: ignore[attr-defined]
        return openapi
    except Exception as exc:
        print(f"Import path failed, will try HTTP fallback: {exc}")
        return None


def try_load_openapi_via_http() -> dict | None:
    import json as _json
    import urllib.request

    url = "http://127.0.0.1:8001/openapi.json"
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = resp.read().decode("utf-8")
            return _json.loads(data)
    except Exception as exc:
        print(f"HTTP fallback failed: {exc}")
        return None


def main():
    repo_root, backend_dir = resolve_paths()

    # Determine output path
    if len(sys.argv) > 1:
        out_path = Path(sys.argv[1])
        if not out_path.is_absolute():
            out_path = (repo_root / out_path).resolve()
    else:
        out_path = (repo_root / "frontend/src/api/openapi.json").resolve()

    openapi = try_load_openapi_via_import(backend_dir)
    if openapi is None:
        openapi = try_load_openapi_via_http()
    if openapi is None:
        raise SystemExit(
            "Could not obtain OpenAPI schema via import or HTTP. Is the backend running or importable?"
        )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(openapi, f, ensure_ascii=False, indent=2)

    print(f"Wrote OpenAPI to {out_path}")


if __name__ == "__main__":
    main()
