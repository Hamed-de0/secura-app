// Minimal adapters for Controls (mocks-first)

import coverageMock from '../../mock/coverage.json';

/**
 * Adds `req_count` per control_id by counting unique (version, requirement) hits
 * using mock coverage data.
 */
export function addReqCounts(items = [], versions = []) {
  const counts = new Map();
  const seen = new Set();

  const versionIds = (Array.isArray(versions) && versions.length > 0)
    ? versions.map(String)
    : Object.keys(coverageMock.versions || {});

  for (const vId of versionIds) {
    const v = coverageMock.versions?.[vId];
    if (!v) continue;
    for (const req of v.requirements || []) {
      for (const hit of req.hits || []) {
        const cid = hit.control_id;
        const key = `${vId}:${req.requirement_id}:${cid}`;
        if (seen.has(key)) continue;
        seen.add(key);
        counts.set(cid, (counts.get(cid) || 0) + 1);
      }
    }
  }

  return (items || []).map(c => ({
    ...c,
    req_count: counts.get(c.control_id) || 0,
  }));
}
