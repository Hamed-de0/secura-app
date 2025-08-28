// Adapter for context controls list
// Maps API rows to UI shape used by ContextDetail Controls tab
// UI row shape:
// {linkId, controlId, code, title, status, verification, coverage, confidence, effect, lastEvidenceAt}

function toNumber(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function toDateIso(x) {
  try {
    if (!x) return null;
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

// Map a single API item to the UI shape
export function adaptContextControl(item = {}) {
  if (!item) return null;
  const linkId = toNumber(item.id ?? item.link_id ?? item.linkId, null);
  const controlId = toNumber(item.control_id ?? item.controlId, null);
  const code = item.code ?? item.reference_code ?? '';
  const title = item.title ?? item.title_en ?? item.title_de ?? '';
  const status = item.status ?? item.assurance_status ?? null;
  const verification = item.verification ?? item.verification_status ?? null;
  // Coverage/confidence/effect can come as 0..1 or 0..100; normalize to 0..100
  const covRaw = item.coverage ?? item.coverage_pct ?? null;
  const confRaw = item.confidence ?? item.confidence_pct ?? null;
  const effRaw = item.effect ?? item.effect_pct ?? null;
  const normalizePct = (v) => {
    if (v == null) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n <= 1 ? Math.round(n * 100) : Math.round(n);
  };
  const coverage = normalizePct(covRaw);
  const confidence = normalizePct(confRaw);
  const effect = normalizePct(effRaw);
  const lastEvidenceAt = toDateIso(item.lastEvidenceAt ?? item.last_evidence ?? item.last_evidence_at);

  return {
    linkId,
    controlId,
    code,
    title,
    status,
    verification,
    coverage,
    confidence,
    effect,
    lastEvidenceAt,
  };
}

// Map a list/response to array of UI rows
export function adaptContextControlsResponse(resp) {
  const items = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.items)
    ? resp.items
    : [];
  return items.map(adaptContextControl).filter(Boolean);
}

