// Adapters keep UI stable even if backend shape changes.

// Normalize "source" to a short label for chips.
function normalizeSource(s) {
  const v = String(s || "").toLowerCase();
  if (!v) return null;
  if (v.includes("iso")) return "ISO";
  if (v.includes("bsi")) return "BSI";
  if (v.includes("gdpr")) return "GDPR";
  if (v.includes("dora")) return "DORA";
  return "Other";
}

export function adaptControl(item) {
  if (!item) return null;

  // FastAPI shape:
  // {
  //   reference_code: "A.5.4",
  //   title_en: "Management responsibilities",
  //   control_source: "ISO 27002 Annex A",
  //   category: "Organizational Controls",
  //   id: 6,
  //   ... (we ignore *_de for now)
  // }
  const controlId = Number(item.control_id ?? item.id);
  const code = item.code ?? item.reference_code ?? "";
  const title =
    item.title ??
    item.title_en ?? // we intentionally ignore translations for now
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
  };
}

/**
 * Accepts either:
 *  - Envelope: { items:[], total, limit, offset }
 *  - Array:    [ ...items ]
 * Returns: { items: adapted[], total, limit, offset }
 */
export function adaptControlsPage(resp, { limit = 50, offset = 0 } = {}) {
  if (Array.isArray(resp)) {
    const items = resp.map(adaptControl);
    return {
      items,
      total: items.length, // unknown; best effort
      limit,
      offset,
    };
  }
  const items = Array.isArray(resp?.items) ? resp.items.map(adaptControl) : [];
  return {
    items,
    total: Number(resp?.total ?? items.length),
    limit: Number(resp?.limit ?? limit),
    offset: Number(resp?.offset ?? offset),
  };
}
