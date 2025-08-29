// Exceptions API services (Compliance Exceptions used for Risk Acceptance)
import { getJSON, postJSON, buildSearchParams } from '../../api/httpClient';

const base = 'compliance/exceptions/';

export async function exceptionsCreate(payload = {}) {
  return await postJSON(`${base}`, { json: payload });
}

export async function exceptionsGet(id) {
  if (!id) return null;
  return await getJSON(`${base}${id}/`);
}

export async function exceptionsSubmit(id) {
  if (!id) return null;
  return await postJSON(`${base}${id}/submit/`, { json: {} });
}

export async function exceptionsApprove(id) {
  if (!id) return null;
  return await postJSON(`${base}${id}/approve/`, { json: {} });
}

export async function exceptionsReject(id) {
  if (!id) return null;
  return await postJSON(`${base}${id}/reject/`, { json: {} });
}

export async function exceptionsWithdraw(id) {
  if (!id) return null;
  return await postJSON(`${base}${id}/withdraw/`, { json: {} });
}

export async function exceptionsList({ contextId, status, limit = 50 } = {}) {
  const params = {};
  if (contextId != null) params.context_id = contextId;
  if (status) params.status = status;
  if (limit) params.limit = limit;
  const searchParams = buildSearchParams(params);
  return await getJSON(`${base}`, { searchParams });
}

// Alias for RiskOps imports: provide a stable list function name
export async function fetchExceptions(params = {}) {
  return await exceptionsList(params);
}
