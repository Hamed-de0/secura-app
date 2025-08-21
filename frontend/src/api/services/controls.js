// Controls service; supports mocks and real FastAPI (limit/offset).
// Flip USE_MOCKS to false when backend is ready.

import { getJSON, buildSearchParams } from "../httpClient";
import { adaptControlsPage, adaptControl } from "../adapters/controls";
import catalog from "../../mock/controls_catalog.json";

let USE_MOCKS = false;
export function setControlsUseMocks(v) {
  USE_MOCKS = !!v;
}

/**
 * List controls with limit/offset and optional q (search).
 * UI-facing contract: { items: [], total, limit, offset }
 */
export async function listControls({ limit = 50, offset = 0, q = "", fields } = {}) {
  if (USE_MOCKS) {
    const all = Array.isArray(catalog) ? catalog : (catalog?.controls || []);
    const filtered = q
      ? all.filter((c) => {
          const hay = `${c.code ?? ""} ${c.title ?? ""}`.toLowerCase();
          return hay.includes(String(q).toLowerCase());
        })
      : all;
    const pageItems = filtered.slice(offset, offset + limit).map(adaptControl);
    return { items: pageItems, total: filtered.length, limit, offset };
  }

  // ---- Real API call (FastAPI) ---------------------------------------------
  // Backend now returns: { data: [...], full_count: N }
  const params = buildSearchParams({ limit, offset, q, fields });
  const resp = await getJSON("controls/controls/", { searchParams: params });
  return adaptControlsPage(resp, { limit, offset });
}

/**
 * Get one control by id (mock/real)
 */
export async function getControl(controlId) {
  if (USE_MOCKS) {
    const all = Array.isArray(catalog) ? catalog : (catalog?.controls || []);
    const raw = all.find((c) => Number(c.control_id ?? c.id) === Number(controlId));
    return adaptControl(raw);
  }
  const resp = await getJSON(`controls/controls/${controlId}/`);
  return adaptControl(resp);
}
