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
    const residual = toNum(it.residual);
    const targetResidual = toNum(it.targetResidual ?? it.target_residual);
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

export function adaptQueueReviewsDue(items = []) {
  return [];
}

export function adaptQueueEvidenceOverdue(items = []) {
  return [];
}

export function adaptQueueControlsAwaitingVerification(items = []) {
  return [];
}

export function adaptQueueExceptionsExpiring(items = []) {
  return [];
}

export function adaptQueueNewChanged(items = []) {
  return [];
}
