// Evidence adapter: normalizes API -> UI for the ContextDetail Evidence tab
// UI shape: { id, controlId, type, ref, capturedAt, freshness, notes, status?, supersedes_id? }

function toStr(x) {
  if (x == null) return '';
  return String(x);
}

function toNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function toIso(x) {
  if (!x) return null;
  try {
    const d = new Date(x);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

function normalizeType(t) {
  const v = String(t || '').toLowerCase();
  if (v.includes('url') || v.includes('link') || v.includes('web')) return 'url';
  if (v.includes('doc') || v.includes('file') || v.includes('pdf')) return 'doc';
  if (v.includes('ticket') || v.includes('jira') || v.includes('case')) return 'ticket';
  if (v.includes('test') || v.includes('report') || v.includes('evidence-test')) return 'test';
  return v || 'other';
}

export function adaptEvidenceItem(item = {}) {
  if (!item) return null;
  const id = toNum(item.id ?? item.evidence_id ?? item.evidenceId);
  const controlId = toNum(item.controlId ?? item.control_id ?? item.linkId ?? item.control_context_link_id);
  const type = normalizeType(item.type ?? item.evidence_type);
  const ref = toStr(item.ref ?? item.evidence_url ?? item.file_path ?? '');
  const capturedAt = toIso(item.capturedAt ?? item.collected_at ?? item.created_at);
  const freshness = (item.freshness === 'warn' || item.freshness === 'overdue') ? item.freshness : 'ok';
  const notes = toStr(item.description ?? item.notes ?? '');

  // Pass-through lifecycle fields without transformation
  const status = item.status;
  const supersedes_id = item.supersedes_id;

  return { id, controlId, type, ref, capturedAt, freshness, notes, status, supersedes_id };
}

export function adaptEvidenceResponse(resp) {
  const arr = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.items)
    ? resp.items
    : [];
  return arr.map(adaptEvidenceItem).filter(Boolean);
}
