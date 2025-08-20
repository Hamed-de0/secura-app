// Controls service; supports mocks and real FastAPI (limit/offset).
// Flip USE_MOCKS to false when backend is ready.

import { getJSON, buildSearchParams } from "../httpClient";
import { adaptControlsPage, adaptControl } from "../adapters/controls";
import catalog from "../../mock/controls_catalog.json";

let USE_MOCKS = true;
export function setControlsUseMocks(v) {
  USE_MOCKS = !!v;
}

/**
 * List controls with limit/offset and optional q (search).
 * UI-facing contract: { items: [], total, limit, offset }
 */
export async function listControls({ limit = 50, offset = 0, q = "", fields } = {}) {
  if (USE_MOCKS) {
    // Filter + paginate from mock catalog
    const all = Array.isArray(catalog) ? catalog : (catalog?.controls || []);
    const filtered = q
      ? all.filter((c) => {
          const hay = `${c.code ?? ""} ${c.title ?? ""}`.toLowerCase();
          return hay.includes(String(q).toLowerCase());
        })
      : all;
    const page = filtered.slice(offset, offset + limit).map(adaptControl);
    return { items: page, total: filtered.length, limit, offset };
  }

  // ---- Real API call (FastAPI) ---------------------------------------------
  // Endpoint: /controls/controls/
  // If backend supports q/limit/offset -> will filter/limit server-side.
  // If not, we fallback to client filtering below.
  const params = buildSearchParams({ limit, offset, q, fields });
  const resp = await getJSON("controls/controls/", { searchParams: params });

  // Adapt both array and envelope shapes
  let page = adaptControlsPage(resp, { limit, offset });

  // Client-side fallback search if server did not filter:
  if (q && page.items.length && !String(JSON.stringify(resp)).toLowerCase().includes(q.toLowerCase())) {
    const filtered = page.items.filter((c) => {
      const hay = `${c.code ?? ""} ${c.title ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    page = { ...page, items: filtered, total: filtered.length, offset: 0 };
  }
  return page;
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
