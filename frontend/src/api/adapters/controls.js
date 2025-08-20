// Adapters keep UI stable even if backend shape changes.

// Normalize "source" to a short label for chips.
function normalizeSource(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return "Other";
  if (v.includes("iso")) return "ISO";
  if (v.includes("bsi")) return "BSI";
  if (v.includes("gdpr")) return "GDPR";
  if (v.includes("dora")) return "DORA";
  if (v.includes("internal")) return "Internal";
  return "Other";
}

export function adaptControl(item) {
  if (!item) return null;

  // FastAPI current shape example:
  // {
  //   reference_code: "A.5.4",
  //   title_en: "Management responsibilities",
  //   control_source: "ISO 27002 Annex A",
  //   category: "Organizational Controls",
  //   id: 6
  // }
  const controlId = Number(item.control_id ?? item.id);
  const code = item.code ?? item.reference_code ?? "";
  const title =
    item.title ??
    item.title_en ?? // ignore other languages for now
    item.name ??
    "";
  const source =
    item.source ??
    normalizeSource(item.control_source ?? item.category);

  // Not provided by backend (yet)
  const assurance_status = item.assurance_status ?? null;

  return {
    control_id: controlId,
    code,
    title,
    source,
    assurance_status,
    category: item.category ?? null,
    control_type: Array.isArray(item.control_type) ? item.control_type : [],
    control_concept: Array.isArray(item.control_concept) ? item.control_concept : [],
    security_domains: Array.isArray(item.security_domains) ? item.security_domains : [],
    capabilities: Array.isArray(item.capabilities) ? item.capabilities : [],
    properties: Array.isArray(item.properties) ? item.properties : [],
  };
}

/**
 * Accepts any of:
 *  - Envelope (new): { data:[], full_count }
 *  - Envelope (old): { items:[], total, limit, offset }
 *  - Array:          [ ...items ]
 * Returns: { items: adapted[], total, limit, offset }
 */
export function adaptControlsPage(resp, { limit = 50, offset = 0 } = {}) {
  // New backend shape
  if (resp && Array.isArray(resp.data)) {
    const items = resp.data.map(adaptControl);
    const total = Number(resp.full_count ?? items.length);
    return { items, total, limit, offset };
  }

  // Older envelope we also support
  if (resp && Array.isArray(resp.items)) {
    const items = resp.items.map(adaptControl);
    return {
      items,
      total: Number(resp.total ?? items.length),
      limit: Number(resp.limit ?? limit),
      offset: Number(resp.offset ?? offset),
    };
  }

  // Raw array fallback
  if (Array.isArray(resp)) {
    const items = resp.map(adaptControl);
    return { items, total: items.length, limit, offset };
  }

  // Last resort: empty page
  return { items: [], total: 0, limit, offset };
}
