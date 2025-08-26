// src/api/services/risks.js
import { getJSON,putJSON, buildSearchParams } from '../../api/httpClient';

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