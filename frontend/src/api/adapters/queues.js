// Queue adapters (placeholders). These will shape backend queue
// responses into stable UI rows for each action queue.

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function toIso(x) {
  if (!x) return null;
  try { const d = new Date(x); return Number.isNaN(d.getTime()) ? null : d.toISOString(); } catch { return null; }
}

function labelScope(it) {
  return (
    it.scopeName || it.scopeDisplay || it.scope || it.scopeRef?.label || '—'
  );
}

export function mapOverAppetite(items = []) {
  const rows = items.map((it) => {
    const id = it.contextId ?? it.id;
    // Keep numeric fields for existing filters, prefer gated residual if provided
    const residualEffective = toNum(it.residual_gated);
    const residual = residualEffective ?? toNum(it.residual);
    const targetResidual = toNum(it.targetResidual ?? it.target_residual);
    const residualDisplay = (it.residual_gated ?? it.residual ?? null);
    const targetResidualDisplay = (it.targetResidual ?? it.target_residual ?? null);
    const greenMax = toNum(it.appetite?.greenMax);
    const amberMax = toNum(it.appetite?.amberMax ?? it.appetite?.yellowMax);
    const deltaAbove = (Number.isFinite(residual) && Number.isFinite(amberMax) && residual > amberMax)
      ? (residual - amberMax)
      : 0;

    return {
      id,
      contextId: id,
      scenarioTitle: it.scenarioTitle ?? it.scenario ?? '—',
      scope: labelScope(it),
      residual: residual ?? null,
      residualEffective: residualEffective ?? null, // optional gated
      targetResidual: targetResidual ?? null,
      residualDisplay,
      targetResidualDisplay,
      greenMax: greenMax ?? null,
      amberMax: amberMax ?? null,
      deltaAbove,
      overAppetite: (typeof it.overAppetite === 'boolean' ? it.overAppetite : undefined),
      owner: it.owner ?? it.owner_name ?? 'Unassigned',
      nextReview: toIso(it.nextReview ?? it.next_review),
      updatedAt: toIso(it.updatedAt ?? it.updated_at ?? it.lastUpdated),
      // pass-through normalized overlays when provided by risks adapter
      policyOverlays: it.policyOverlays,
    };
  });
  // Prefer server overAppetite overlay; fallback to residual vs amberMax
  return rows.filter((r) => (r.overAppetite === true) || (Number.isFinite(r.residual) && Number.isFinite(r.amberMax) && r.residual > r.amberMax));
}

function slaFromOverlayOrDate(item, { now = new Date(), horizonDays = 30 } = {}) {
  const overlay = item.reviewSLAStatus ?? item.review_sla_status ?? item.reviewSLA ?? item.review_sla;
  const normalize = (s) => String(s || '').toLowerCase();
  if (overlay) {
    const v = normalize(overlay);
    if (v === 'ontrack' || v === 'ok' || v === 'on_track') return 'OK';
    if (v === 'duesoon' || v === 'due_soon' || v === 'warn') return 'WARN';
    if (v === 'overdue' || v === 'late') return 'OVERDUE';
  }
  // Fallback: compute from nextReview
  const iso = toIso(item.nextReview ?? item.next_review);
  if (!iso) return 'OK';
  const ts = new Date(iso).getTime();
  const nowTs = now.getTime();
  if (!Number.isFinite(ts)) return 'OK';
  if (ts < nowTs) return 'OVERDUE';
  const horizonMs = horizonDays * 24 * 60 * 60 * 1000;
  if (ts <= nowTs + horizonMs) return 'WARN';
  return 'OK';
}

export function mapReviewsDue(items = [], opts = {}) {
  const rows = items.map((it) => {
    const id = it.contextId ?? it.id;
    const slaFlag = slaFromOverlayOrDate(it, opts);
    return {
      id,
      contextId: id,
      scenarioTitle: it.scenarioTitle ?? it.scenario ?? '—',
      scope: labelScope(it),
      owner: it.owner ?? it.owner_name ?? 'Unassigned',
      nextReview: toIso(it.nextReview ?? it.next_review),
      slaFlag,
      updatedAt: toIso(it.updatedAt ?? it.updated_at ?? it.lastUpdated),
      policyOverlays: it.policyOverlays,
    };
  });
  // Only rows that need attention (WARN or OVERDUE)
  return rows.filter((r) => r.slaFlag === 'WARN' || r.slaFlag === 'OVERDUE');
}

// Evidence Overdue adapter: expects a list of evidence items (already adapted) and drops non-active unless status='all'
export function adaptQueueEvidenceOverdue(items = [], { status = 'active' } = {}) {
  const arr = Array.isArray(items) ? items : [];
  const wantAll = String(status || '').toLowerCase() === 'all';
  const rows = arr
    .filter((ev) => ev && (wantAll || !ev.status || String(ev.status).toLowerCase() === 'active'))
    .filter((ev) => ev.freshness === 'warn' || ev.freshness === 'overdue')
    .map((ev) => ({
      id: ev.id,
      contextId: ev.contextId ?? ev.context_id ?? null,
      controlId: ev.controlId ?? ev.control_id ?? null,
      type: ev.type,
      freshness: ev.freshness,
      capturedAt: ev.capturedAt,
      status: ev.status || 'active',
      policyOverlays: ev.policyOverlays,
    }));
  return rows;
}

// Controls Awaiting Verification: pass-through; evidence status filtering typically applied server-side
export function adaptQueueControlsAwaitingVerification(items = []) {
  return Array.isArray(items) ? items.map((it) => ({ ...it, policyOverlays: it.policyOverlays })) : [];
}

export function mapExceptionsExpiring(items = [], { horizonDays = 30 } = {}) {
  const today = new Date();
  const rows = (Array.isArray(items) ? items : []).map((ex) => {
    const contextId = Number(ex.risk_scenario_context_id ?? ex.context_id ?? ex.contextId);
    const controlId = ex.control_id ?? ex.controlId;
    const reqId = ex.framework_requirement_id ?? ex.frameworkRequirementId;
    const endDate = ex.end_date || ex.endDate || null; // 'YYYY-MM-DD'
    let reference = ex.title || '';
    if (reqId) reference = `Req #${reqId}`;
    if (controlId) reference = `Ctrl #${controlId}`;
    return {
      id: ex.id ?? `${contextId}-${controlId || reqId || 'ex'}`,
      contextId,
      reference,
      endDate,
      owner: ex.owner || ex.requested_by || 'Unassigned',
      policyOverlays: ex.policyOverlays,
    };
  });
  // filter: endDate within horizonDays from today
  const inHorizon = (d) => {
    if (!d) return false;
    const ts = Date.parse(d);
    if (!Number.isFinite(ts)) return false;
    const ms = ts - today.getTime();
    return ms >= 0 && ms <= horizonDays * 24 * 60 * 60 * 1000;
  };
  return rows.filter((r) => inHorizon(r.endDate));
}

export function mapRecentChanges(items = [], { days = 7 } = {}) {
  const now = Date.now();
  const within = (iso) => {
    if (!iso) return false;
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return false;
    return now - t <= days * 24 * 60 * 60 * 1000;
  };
  return (Array.isArray(items) ? items : []).map((it) => {
    const id = it.contextId ?? it.id;
    return {
      id,
      contextId: id,
      scenarioTitle: it.scenarioTitle ?? it.scenario ?? '—',
      scope: labelScope(it),
      owner: it.owner ?? it.owner_name ?? 'Unassigned',
      updatedAt: toIso(it.updatedAt ?? it.updated_at ?? it.lastUpdated),
      policyOverlays: it.policyOverlays,
    };
  }).filter((r) => within(r.updatedAt));
}

/**
 * Summarize the server queues payload into counts for KPI tiles.
 * Accepts the raw response from GET /dashboards/riskops/queues/.
 */
export function summarizeQueues(resp = {}) {
  const arr = (k) => (Array.isArray(resp?.[k]) ? resp[k] : []);
  return {
    overAppetite: arr('overAppetite').length,
    reviewsDue: arr('reviewsDue').length,
    evidenceOverdue: arr('evidenceOverdue').length,
    awaitingVerification: arr('awaitingVerification').length,
    exceptionsExpiring: arr('exceptionsExpiring').length,
    recentChanges: arr('recentChanges').length,
  };
}
