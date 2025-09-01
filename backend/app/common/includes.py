from __future__ import annotations
from typing import Iterable, List, Set, Union

def parse_includes(include: Union[List[str], str, None], default: Iterable[str] = ()) -> Set[str]:
    """
    Accepts either repeatable ?include=a&include=b or comma-separated include=a,b.
    Returns a set of normalized, non-empty strings. Falls back to `default` when None.
    """
    out: Set[str] = set()
    if include is None:
        out.update(default)
        return out

    if isinstance(include, str):
        parts = [p.strip() for p in include.split(",")]
        out.update([p for p in parts if p])
        return out

    # include is a List[str] (can still contain comma-separated items)
    for item in include:
        if not item:
            continue
        if "," in item:
            for p in item.split(","):
                p = p.strip()
                if p:
                    out.add(p)
        else:
            out.add(item.strip())
    return out
