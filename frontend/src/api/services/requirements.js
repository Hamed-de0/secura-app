// Requirements service (real backend).
// Endpoint per version:
//   GET /framework_requirements/versions/:version_id/requirements/
// Returns items; we adapt to include parent_id and sort_index for the tree.

let coverageMock = null;
try {
  // eslint-disable-next-line global-require
  coverageMock = require("../../mock/coverage.json");
} catch (_) {
  coverageMock = null;
}

import { getJSON, buildSearchParams } from "../httpClient";

function hitsFromMock(version_id, reqId) {
  try {
    const v = coverageMock?.versions?.[String(version_id)];
    if (!v) return 0;
    const r = (v.requirements || []).find(
      (x) => Number(x.requirement_id ?? x.id) === Number(reqId)
    );
    return Array.isArray(r?.hits) ? r.hits.length : 0;
  } catch {
    return 0;
  }
}

function adaptRequirement(item, version_id) {
  if (!item) return null;
  const requirement_id = Number(item.requirement_id ?? item.id ?? item.req_id);
  const code =
    item.code ??
    item.reference_code ??
    item.req_code ??
    item.clause ??
    "";
  const title =
    item.title ??
    item.title_en ??
    item.name ??
    item.text ??
    "";
  const parent_id =
    item.parent_id == null
      ? null
      : Number(item.parent_id);
  const sort_index =
    Number.isFinite(Number(item.sort_index)) ? Number(item.sort_index) : null;

  const hits_count = hitsFromMock(version_id, requirement_id);
  return { requirement_id, code, title, parent_id, sort_index, hits_count };
}

function pickArray(resp) {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.items)) return resp.items;
  return [];
}

export async function listRequirements({
  version_id,
  q = "",
  limit,
  offset,
} = {}) {
  if (!version_id) throw new Error("version_id is required");
  const path = `framework_requirements/versions/${version_id}/requirements/`;

  const params = buildSearchParams({
    q: q && q.length >= 2 ? q : "",
    limit,
    offset,
  });

  const resp = await getJSON(path, { searchParams: params });
  let arr = pickArray(resp);

  // Fallback client-side filter if server didn't filter by q
  if (q && q.length >= 2) {
    const ql = q.toLowerCase();
    arr = arr.filter((r) => {
      const code = String(r.code ?? r.reference_code ?? "").toLowerCase();
      const title = String(r.title ?? r.title_en ?? r.name ?? "").toLowerCase();
      return code.includes(ql) || title.includes(ql);
    });
  }

  const items = arr.map((r) => adaptRequirement(r, version_id)).filter(Boolean);
  return items;
}
