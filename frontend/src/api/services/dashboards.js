// src/api/services/dashboards.js
import { getJSON, buildSearchParams } from '../../api/httpClient';

/**
 * Fetch pre-filtered RiskOps queues in a single call.
 * GET 'dashboards/riskops/queues/' (trailing slash kept)
 */
export async function fetchRiskOpsQueues(params = {}) {
  const defaults = { limit: 10, horizon_days: 30, recent_days: 7 };
  const searchParams = buildSearchParams({ ...defaults, ...params });
  return await getJSON('dashboards/riskops/queues/', { searchParams });
}

