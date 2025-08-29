// Exceptions adapter (Compliance Exceptions -> Risk Acceptance-friendly)

function toIso(x) {
  if (!x) return null;
  try {
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

export function adaptException(e = {}) {
  if (!e || typeof e !== 'object') return null;
  const isAcceptance = !!(e.risk_acceptance_ref);
  const start = e.startDate || e.start_date || null;
  const end = e.endDate || e.end_date || null;
  return {
    id: e.id,
    isAcceptance,
    status: e.status,
    // normalized dates as ISO strings
    startDate: toIso(start),
    endDate: toIso(end),
    title: e.title || '',
    description: e.description || null,
    reason: e.reason || null,
    compensatingControls: e.compensating_controls || e.compensatingControls || null,
    // keep existing optional fields for compatibility
    requestedBy: e.requested_by || e.requestedBy || null,
    approverId: e.approver_id || e.approverId || null,
    // legacy alias (not required by spec but preserved)
    notes: e.reason || e.description || null,
  };
}
