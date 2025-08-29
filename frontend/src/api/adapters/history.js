// History adapter: build change-log rows from RiskScoreHistory entries
// Input items (from /risk-scores/context/history/{id}):
//   { created_at, initial_score, residual_score, initial_by_domain:{C,I,A,L,R}, residual_by_domain:{...} }
// Output rows: { ts, field, from, to, actor? }

function toIso(x) {
  try {
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

function cmpNum(a, b) {
  const na = Number(a), nb = Number(b);
  if (!Number.isFinite(na) && !Number.isFinite(nb)) return false;
  return na !== nb;
}

export function adaptHistoryChanges(items = []) {
  const arr = Array.isArray(items) ? items.slice() : [];
  if (arr.length === 0) return [];
  // sort by created_at asc to compute forward diffs
  arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const out = [];
  let prev = null;
  for (const it of arr) {
    const ts = toIso(it.created_at) || new Date().toISOString();
    if (prev) {
      // residual_score
      if (cmpNum(prev.residual_score, it.residual_score)) {
        out.push({ ts, field: 'residual', from: prev.residual_score, to: it.residual_score });
      }
      // initial_score
      if (cmpNum(prev.initial_score, it.initial_score)) {
        out.push({ ts, field: 'initial', from: prev.initial_score, to: it.initial_score });
      }
      // per-domain residual
      const domains = ['C','I','A','L','R'];
      const pr = prev.residual_by_domain || {}, cr = it.residual_by_domain || {};
      for (const d of domains) {
        if (cmpNum(pr[d], cr[d])) out.push({ ts, field: `residual.${d}`, from: pr[d] ?? 0, to: cr[d] ?? 0 });
      }
      // per-domain initial
      const pi = prev.initial_by_domain || {}, ci = it.initial_by_domain || {};
      for (const d of domains) {
        if (cmpNum(pi[d], ci[d])) out.push({ ts, field: `initial.${d}`, from: pi[d] ?? 0, to: ci[d] ?? 0 });
      }
    }
    prev = it;
  }
  return out;
}

// Map evidence lifecycle items into a simple change-log list
// Input events: [{ id, evidence_id, event, actor_id, notes, created_at }]
// Output rows: { ts, actor, action, notes }
export function adaptEvidenceLifecycle(items = []) {
  const arr = Array.isArray(items) ? items : [];
  return arr.map((ev) => ({
    ts: toIso(ev.created_at) || null,
    actor: ev.actor_id ?? ev.actor ?? null,
    action: String(ev.event || '').toLowerCase(),
    notes: ev.notes || null,
  })).filter((r) => !!r.ts && !!r.action);
}

// Normalize unified context change feed into UI-friendly rows
// Input: ChangeItem[] (from /risks/risk_scenario_contexts/{id}/changes/)
// Output: [{ ts, type, label, from?, to?, actor?, link? }]
export function adaptContextChanges(items = []) {
  const arr = Array.isArray(items) ? items : [];
  return arr.map((it) => {
    const ts = toIso(it.ts || it.created_at) || null;
    const type = String(it.type || '').toLowerCase();
    let label = 'Change';
    let link = undefined;
    // prefer alias key 'from' but accept 'from_' as fallback
    const fromVal = (it.hasOwnProperty('from') ? it.from : it.from_);
    const toVal = it.to;
    const actor = it.actor ?? it.actor_id ?? null;

    if (type === 'residual') {
      const fld = String(it.field || '').toLowerCase();
      let domain = 'Overall';
      if (fld === 'overall' || fld === 'residual' || !fld) {
        domain = 'Overall';
      } else {
        domain = fld.toUpperCase();
      }
      label = `Residual (${domain}) changed`;
    } else if (type === 'evidence') {
      const sub = String(it.subtype || '').toLowerCase();
      const idPart = (it.entityId != null ? `#${it.entityId} ` : '');
      label = `Evidence ${idPart}${sub || 'event'}`.trim();
      // if status changed, append destination
      if (String(it.field || '').toLowerCase() === 'status' && (toVal != null)) {
        label = `${label} (to ${toVal})`;
      }
      if (it.entityId != null) link = { type: 'evidence', id: it.entityId };
    }

    return {
      ts,
      type,
      label,
      field: label,
      from: fromVal,
      to: toVal,
      actor,
      link,
    };
  }).filter((r) => !!r.ts && !!r.type);
}
