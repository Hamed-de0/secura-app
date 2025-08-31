// src/api/services/compliance.js
import { getJSON, buildSearchParams } from '../../api/httpClient';
import { DEFAULT_SCOPE } from '../../app/constants';


// KPI summary
export async function fetchComplianceSummary({
  versionId,
  scopeType = DEFAULT_SCOPE.scopeType,
  scopeId   = DEFAULT_SCOPE.scopeId,
}) {
  if (!versionId) throw new Error('fetchComplianceSummary: versionId is required');
  const searchParams = buildSearchParams({
    version_id: versionId,
    scope_type: scopeType,
    scope_id:   scopeId,
  });
  return await getJSON('compliance/coverage/summary', { searchParams });
}

// Active frameworks at scope
export async function fetchActiveFrameworks({ scopeType, scopeId }) {
  const qs = new URLSearchParams({ scope_type: scopeType, scope_id: String(scopeId) });
  return getJSON(`policies/framework-activation/active-for-scope?${qs.toString()}`);
}
// export async function fetchActiveFrameworks({
//   scopeType = DEFAULT_SCOPE.scopeType,
//   scopeId   = DEFAULT_SCOPE.scopeId,
// }) {
//   const searchParams = buildSearchParams({
//     scope_type: scopeType,
//     scope_id:   scopeId,
//   });
//   return await getJSON('policies/framework-activation/active-for-scope', { searchParams });
// }

// Requirements status (page of gaps/partials etc.)
export async function fetchRequirementsStatusPage({
  versionId,
  scopeType = DEFAULT_SCOPE.scopeType,
  scopeId   = DEFAULT_SCOPE.scopeId,
  status, sortBy, sortDir, page = 1, size = 10, ancestor_id, q,
}) {
  const searchParams = buildSearchParams({
    version_id:  versionId,
    scope_type:  scopeType,
    scope_id:    scopeId,
    status,
    sort:        sortBy,
    sort_dir:    sortDir,
    page,
    size,
    ancestor_id,
    q,
  });
  return await getJSON('compliance/requirements/status', { searchParams });
}



// Requirements tree (for left panel)
export async function fetchRequirementsTree({ versionId }) {
      if (!versionId) throw new Error('fetchComplianceSummary: versionId is required');

  const searchParams = buildSearchParams({ version_id: versionId });
  return await getJSON('compliance/requirements/tree', { searchParams });
}


// Evidence: expired / expiring soon (right column widget)
export async function fetchStaleEvidence({ withinDays = 30, scopeType, scopeId, status, page = 1, size = 10 }) {
  const searchParams = buildSearchParams({
    within_days: withinDays, scope_type: scopeType, scope_id: scopeId, status, page, size,
  });
  return await getJSON('evidence/stale', { searchParams });
}

// Effective coverage (for requirement drawer – we filter to one requirement client-side)
export async function fetchEffectiveCoverage({ versionId, scopeType, scopeId }) {
  const searchParams = buildSearchParams({ scope_type: scopeType, scope_id: scopeId });
  return await getJSON(`coverage/framework_versions/${versionId}/effective`, { searchParams });
}

export async function fetchCoverageRollup({ versionId, scopeTypes = [] }) {
  const sp = new URLSearchParams();
  sp.set("version_id", String(versionId));
  for (const st of scopeTypes) sp.append("scope_types", st); // -> &scope_types=entity&scope_types=org...
  return getJSON("coverage/rollup", { searchParams: sp });   // no leading slash
}

// export async function fetchCoverageRollup({ versionId, scopeTypes = [] }) {
//   // IMPORTANT: no leading slash (prefixUrl in http client)
//   const searchParams = {
//     version_id: versionId,
//     ...(scopeTypes.length ? { scope_types: scopeTypes.join(",") } : {}),
//   };
//   return getJSON("coverage/rollup", { searchParams });
// }


