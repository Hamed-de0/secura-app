from __future__ import annotations
from datetime import date, datetime, timezone, time
from typing import Optional, Union

DateLike = Union[str, date, datetime, None]
TsLike = Union[str, datetime, date, None]


def iso_date(v: DateLike) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, str):
        return v
    if isinstance(v, datetime):
        v = v.date()
    try:
        return v.isoformat()
    except Exception:
        return str(v)

def iso_ts(v: TsLike) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, str):
        return v
    # If it's a date (not datetime), promote to midnight UTC
    if isinstance(v, date) and not isinstance(v, datetime):
        v = datetime.combine(v, datetime.min.time(), tzinfo=timezone.utc)
    # If it's a naive datetime, assume UTC
    if isinstance(v, datetime) and v.tzinfo is None:
        v = v.replace(tzinfo=timezone.utc)
    try:
        return v.isoformat()
    except Exception:
        return str(v)

def _to_dt(d):
    if d is None:
        return None
    if isinstance(d, datetime):
        return d
    if isinstance(d, date):
        return datetime.combine(d, time.min)
    return None