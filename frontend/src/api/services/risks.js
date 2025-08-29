// src/api/services/risks.js
import { getJSON,putJSON, postJSON, deleteJSON, buildSearchParams } from '../../api/httpClient';


const context_url = 'risks/risk_scenario_contexts/';
const scenario_url = 'risks/risk_scenarios/';


/** Fetch “effective” risks for an asset. Keeps trailing slash. */
export async function fetchAssetEffectiveRisks(assetId, { days = 90 } = {}) {
  const url = `risks/assets/${assetId}/risks/`;
  const searchParams = buildSearchParams({ view: 'effective', days });
  const data = await getJSON(url, { searchParams });
  return Array.isArray(data) ? data : [];
}


/** Fetch aggregated metrics for the Risk Dashboard (server-side paging-safe). */
export async function fetchRiskMetrics(filters = {}) {
  const defaults = { scope: 'all', status: 'all', domain: 'all', days: 90 };
  const searchParams = buildSearchParams({ ...defaults, ...filters });
  // trailing slash matters
  return await getJSON('risks/risk_scenario_contexts/metrics/', { searchParams });
}

export async function fetchRiskContexts(params = {}) {
  const defaults = {
    offset: 0,
    limit: 10,
    sort: 'updated_at',
    sort_dir: 'desc',
    scope: 'all',
    status: 'all',
    domain: 'all',
    days: 90,
  };
  const searchParams = buildSearchParams({ ...defaults, ...params });
  return await getJSON('risks/risk_scenario_contexts/contexts/', { searchParams });
}

// Get full detail for a single Risk Scenario Context
export async function fetchRiskContextDetail(contextId) {
  if (!contextId) return null;
  // trailing slash required by your ky client / API
  return await getJSON(`risks/risk_scenario_contexts/${contextId}/details/`);
}

export async function updateRiskContextOwner(contextId, ownerId) {
  const url = `risks/risk_scenario_contexts/${contextId}/`; // trailing slash
  return await putJSON(url, {json:{ owner_id: ownerId }});
}

/**
 * Alias for per-row owner update (kept for clarity in bulk flows).
 * Uses PUT under the hood; backend accepts it for partial updates of owner.
 */
export async function patchRiskContextOwner(contextId, ownerId) {
  return updateRiskContextOwner(contextId, ownerId);
}

/**
 * Bulk assign owner to multiple context IDs via fan-out of per-row updates.
 * Returns { updated, failed } counts.
 */
export async function bulkAssignRiskContextOwner(ids = [], ownerId) {
  let updated = 0, failed = 0;
  for (const id of ids) {
    try {
      await updateRiskContextOwner(id, ownerId);
      updated += 1;
    } catch (_) {
      failed += 1;
    }
  }
  return { updated, failed };
}

export async function fetchScenarios({ q = '', limit = 500, offset = 0 } = {}) {
  const searchParams = buildSearchParams({ q, limit, offset });
  const data = await getJSON(scenario_url, { searchParams });

  const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  return items.map(s => ({
    id: s.id ?? s.scenarioId,
    title: s.title_en || s.title_de || `Scenario #${s.id}`,
    description: s.description || '',
    // optional baseline if provided
    baseline: {
      likelihood: s.baseline?.likelihood ?? s.likelihood ?? 3,
      impacts: s.baseline?.impacts ?? s.impacts ?? { C:2, I:2, A:2, L:2, R:2 },
    },
    tags: s.tags || [],
  }));
}

export async function prefillRiskContexts(pairs) {
  const url = `${context_url}prefill/`;  // trailing slash
  const res = await postJSON(url, { json: { pairs } });
  return Array.isArray(res) ? res : [];
}

/** Bulk create risk scenario contexts (spec-shaped wrapper).
 * items: [{ scenarioId, scopeRef:{type,id}, likelihood?, impacts?, ownerId?, nextReview? }]
 */
export async function bulkCreateRiskContexts(items, idempotencyKey) {
  const url = `${context_url}bulk_create/`; // trailing slash
  const body = { items };
  if (idempotencyKey) body.idempotencyKey = idempotencyKey;
  const res = await postJSON(url, { json: body });
  return res || { createdIds: [], skipped: [], updated: [] };
}

// ---- Context Controls (M4) --------------------------------------------------
export async function fetchContextControls(contextId, { offset = 0, limit = 25, sort_by = 'status', sort_dir = 'asc', include = 'summary' } = {}) {
  if (!contextId) return { items: [], total: 0, summary: null };
  const searchParams = buildSearchParams({ offset, limit, sort_by, sort_dir, include });
  // Note: controls M4 router is mounted under /risks and declares a nested /risks/* prefix,
  // so the effective path is /risks/risks/risk_scenario_contexts/{id}/controls/.
  const url = `risks/risks/risk_scenario_contexts/${contextId}/controls/`;
  const resp = await getJSON(url, { searchParams });
  return resp || { items: [], total: 0 };
}

// Suggested controls for a scenario (exclude those already linked to the given context)
export async function fetchSuggestedControlsForContext({ scenarioId, contextId, limit = 20 } = {}) {
  if (!scenarioId) return [];
  const searchParams = buildSearchParams({ context_id: contextId, limit });
  const url = `controls/control-risk-links/by-scenario/${scenarioId}/suggest/`;
  const resp = await getJSON(url, { searchParams });
  return Array.isArray(resp) ? resp : [];
}

// Apply a suggested control to a context (create link with default status 'mapped')
export async function applySuggestedControlToContext(contextId, controlId, status = 'mapped') {
  const url = `risks/risks/risk_scenario_contexts/${contextId}/controls/`;
  return postJSON(url, { json: { controlId, status } });
}

// ---- Context Evidence (M4) -------------------------------------------------
export async function fetchContextEvidence(contextId, { offset = 0, limit = 50, sort_by = 'captured_at', sort_dir = 'desc', type, control_id, freshness, status } = {}) {
  if (!contextId) return { items: [], total: 0, summary: null };
  const search = { offset, limit, sort_by, sort_dir };
  if (type) search.type = type;
  if (control_id) search.control_id = control_id;
  if (freshness) search.freshness = freshness;
  if (status) search.status = status; // lifecycle filter (active|retired|superseded|draft|all)
  const searchParams = buildSearchParams(search);
  const url = `risks/risks/risk_scenario_contexts/${contextId}/evidence/`;
  const resp = await getJSON(url, { searchParams });
  return resp || { items: [], total: 0 };
}

// List context evidence with optional lifecycle status filter
export async function listContextEvidence(contextId, { offset = 0, limit = 50, sort_by = 'captured_at', sort_dir = 'desc', type, control_id, freshness, status } = {}) {
  if (!contextId) return { items: [], total: 0, summary: null };
  const search = { offset, limit, sort_by, sort_dir };
  if (type) search.type = type;
  if (control_id) search.control_id = control_id;
  if (freshness) search.freshness = freshness;
  if (status) search.status = status; // 'active' | 'retired' | 'superseded' | 'draft' | 'all'
  const searchParams = buildSearchParams(search);
  const url = `risks/risks/risk_scenario_contexts/${contextId}/evidence/`;
  const resp = await getJSON(url, { searchParams });
  return resp || { items: [], total: 0 };
}

// Treat delete as retire (soft-delete on backend)
export async function deleteContextEvidence(contextId, evidenceId) {
  if (!contextId || !evidenceId) return { ok: false };
  const url = `risks/risks/risk_scenario_contexts/${contextId}/evidence/${evidenceId}/`;
  return await deleteJSON(url, {});
}

// Back-compat alias: deleteEvidence = retire
export async function deleteEvidence(contextId, evidenceId) {
  return deleteContextEvidence(contextId, evidenceId);
}

// Restore a retired evidence item
export async function restoreEvidence(contextId, evidenceId) {
  if (!contextId || !evidenceId) return { ok: false };
  const url = `risks/risks/risk_scenario_contexts/${contextId}/evidence/${evidenceId}/restore/`;
  // send empty body to maintain JSON Content-Type
  return await postJSON(url, { json: {} });
}

// Supersede an evidence item with a replacement
export async function supersedeEvidence(contextId, evidenceId, replacementId) {
  if (!contextId || !evidenceId || !replacementId) return { ok: false };
  const url = `risks/risks/risk_scenario_contexts/${contextId}/evidence/${evidenceId}/supersede/`;
  return await postJSON(url, { json: { replacement_id: replacementId } });
}

// ---- Context History -------------------------------------------------------
export async function fetchContextHistory(contextId, { days = 90 } = {}) {
  if (!contextId) return [];
  // risk-score router is mounted under /risks → effective /risks/risk-scores/...
  const url = `risks/risk-scores/context/history/${contextId}/`;
  const resp = await getJSON(url, { });
  return Array.isArray(resp) ? resp : [];
}

// Unified change feed for a context (residual deltas + evidence lifecycle)
export async function fetchContextChanges(contextId, { days = 90, limit = 100, cursor } = {}) {
  if (!contextId) return { changes: [], nextCursor: null };
  const url = `risks/risk_scenario_contexts/${contextId}/changes/`;
  const searchParams = buildSearchParams({ days, limit, cursor });
  const resp = await getJSON(url, { searchParams });
  return resp || { changes: [], nextCursor: null };
}
