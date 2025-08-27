// src/api/services/risks.js
import { getJSON,putJSON, postJSON, buildSearchParams } from '../../api/httpClient';


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
    sort_by: 'id',
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
  return await getJSON(`risks/risk_scenario_contexts/${contextId}/details`);
}

export async function updateRiskContextOwner(contextId, ownerId) {
  const url = `risks/risk_scenario_contexts/${contextId}`; // trailing slash
  return await putJSON(url, {json:{ owner_id: ownerId }});
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
