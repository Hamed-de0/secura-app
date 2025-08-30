// src/api/adapters/compliance.js

export function statusChipMeta(status, exception = false) {
  const s = String(status || '').toLowerCase();
  const color = s === 'met' ? 'success' : s === 'partial' ? 'warning' : s === 'gap' ? 'error' : 'default';
  const variant = exception ? 'outlined' : 'filled';
  return { color, variant, label: exception ? `${s}*` : s || '—' };
}

export function adaptSummaryToKpis(sum) {
  if (!sum) return {
    coveragePct: 0, coveragePctNoEx: 0,
    met: 0, partial: 0, gap: 0, unknown: 0,
    lastComputedAt: null,
  };
  return {
    coveragePct: sum.coverage_pct ?? 0,
    coveragePctNoEx: sum.coverage_pct_excl_exceptions ?? 0,
    met: sum.met ?? 0,
    partial: sum.partial ?? 0,
    gap: sum.gap ?? 0,
    unknown: sum.unknown ?? 0,
    lastComputedAt: sum.last_computed_at || null,
  };
}

export function adaptStatusItem(it) {
  // Normalize fields expected by grid + drawer
  return {
    id: it.requirement_id,
    requirement_id: it.requirement_id,
    code: it.code || String(it.requirement_id),
    title: it.title || '',
    status: it.status || 'unknown',
    score: Number(it.score ?? 0),
    exception_applied: !!it.exception_applied,
    parent_id: it.parent_id ?? null,
    top_level_id: it.top_level_id ?? null,
    top_level_code: it.top_level_code ?? null,
    breadcrumb: it.breadcrumb || null,
  };
}

export function adaptStatusPage(page) {
  const items = (page?.items || []).map(adaptStatusItem);
  return {
    total: page?.total ?? items.length,
    items,
    page: page?.page ?? 1,
    size: page?.size ?? items.length,
  };
}

export function pickRequirementDetailFromCoverage(fcov, requirementId) {
  const r = (fcov?.requirements || []).find(x => Number(x.requirement_id) === Number(requirementId));
  if (!r) return null;
  // Derive “gaps” = mapped but no effective hit (if backend gives only hits, leave empty array)
  const hits = r.hits || [];
  return {
    requirement_id: r.requirement_id,
    code: r.code || String(r.requirement_id),
    title: r.title || '',
    score: r.score ?? 0,
    status: r.status || 'unknown',
    exception_applied: !!r.exception_applied,
    hits,
    mapped_but_not_effective: r.mapped_but_not_effective || [],
  };
}
