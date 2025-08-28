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
    // Keep numeric fields for existing filters, but also pass-through raw for UI display
    const residual = toNum(it.residual);
    const targetResidual = toNum(it.targetResidual ?? it.target_residual);
    const residualDisplay = it.residual ?? null;
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
      targetResidual: targetResidual ?? null,
      residualDisplay,
      targetResidualDisplay,
      greenMax: greenMax ?? null,
      amberMax: amberMax ?? null,
      deltaAbove,
      owner: it.owner ?? it.owner_name ?? 'Unassigned',
      nextReview: toIso(it.nextReview ?? it.next_review),
      updatedAt: toIso(it.updatedAt ?? it.updated_at ?? it.lastUpdated),
    };
  });
  // Client-side filter fallback: keep only rows where residual > amberMax
  return rows.filter((r) => Number.isFinite(r.residual) && Number.isFinite(r.amberMax) && r.residual > r.amberMax);
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
    };
  });
  // Only rows that need attention (WARN or OVERDUE)
  return rows.filter((r) => r.slaFlag === 'WARN' || r.slaFlag === 'OVERDUE');
}

export function adaptQueueEvidenceOverdue(items = []) {
  return [];
}

export function adaptQueueControlsAwaitingVerification(items = []) {
  return [];
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
