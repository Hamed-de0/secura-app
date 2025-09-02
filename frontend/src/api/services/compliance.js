// src/api/services/compliance.js
import { getJSON, postJSON, buildSearchParams } from '../../api/httpClient';
import { uploadFile } from "../fileClient";

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


// Requirements status (page of gaps/partials etc.)
export async function fetchRequirementsStatusPage_({
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

export async function fetchRequirementsStatusPage({
  versionId,
  scopeType,
  scopeId,
  status,          // string | string[] e.g. "met" or ["gap","partial"]
  q,
  ancestorId,
  page = 1,
  size = 50,
  sortBy = "code",
  sortDir = "asc",
}) {
  const searchParams = {
    version_id: versionId,
    scope_type: scopeType,
    scope_id: scopeId,
    page,
    size,
    sort_by: sortBy,
    sort_dir: sortDir,
  };
  if (scopeId === undefined || scopeId === null) delete searchParams.scope_id;
  if (q) searchParams.q = q;
  if (ancestorId != null) searchParams.ancestor_id = ancestorId;
  if (status && (Array.isArray(status) ? status.length : true)) {
    searchParams.status = Array.isArray(status) ? status.join(",") : status;
  }

  // NOTE: no leading slash here because your http client sets prefixUrl
  return getJSON("compliance/requirements/status", { searchParams });
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

export async function fetchRequirementDetail({ requirementId, versionId, scopeType, scopeId, include }) {
  const params = new URLSearchParams();
  params.set('version_id', String(versionId));
  params.set('scope_type', String(scopeType));
  params.set('scope_id', String(scopeId));

  // Accept array or comma-separated string; default to desired set.
  const includes = Array.isArray(include)
    ? include
    : (typeof include === 'string'
        ? include.split(',').map(s => s.trim()).filter(Boolean)
        : ['mappings', 'evidence', 'exceptions', 'status']);

  // Append as repeated query keys: &include=...&include=...
  const seen = new Set();
  for (const inc of includes) {
    if (!seen.has(inc)) {
      params.append('include', inc);
      seen.add(inc);
    }
  }

  return getJSON(`compliance/requirements/${requirementId}/detail`, { searchParams: params });
}

// --- ADD BELOW your existing exports (keep getJSON wrapper as-is) ---

export async function fetchRequirementOverview({ requirementId, versionId, scopeType, scopeId, include }) {
  const params = new URLSearchParams();
  params.set('version_id', String(versionId));
  if (scopeType) params.set('scope_type', String(scopeType));
  if (scopeId != null) params.set('scope_id', String(scopeId));
  const includes = Array.isArray(include)
    ? include
    : (typeof include === 'string' ? include.split(',').map(s => s.trim()).filter(Boolean) : [
        'usage','mappings','evidence','exceptions','lifecycle','owners','suggested_controls'
      ]);
  const seen = new Set();
  for (const inc of includes) { if (!seen.has(inc)) { params.append('include', inc); seen.add(inc); } }
  return getJSON(`compliance/requirement/${requirementId}/overview`, { searchParams: params });
}

export async function fetchRequirementTimeline({ requirementId, versionId, scopeType, scopeId, kinds = ['evidence','exception','mapping'], page = 1, size = 100 }) {
  const params = new URLSearchParams();
  params.set('version_id', String(versionId));
  if (scopeType) params.set('scope_type', String(scopeType));
  if (scopeId != null) params.set('scope_id', String(scopeId));
  for (const k of kinds) params.append('kinds', k);
  params.set('page', String(page));
  params.set('size', String(size));
  return getJSON(`compliance/requirement/${requirementId}/timeline`, { searchParams: params });
}

// --- ADD these helpers (leave existing exports as-is) ---
// --- Evidence CRUD (align with backend payloads) ---

export async function createEvidence({
  control_context_link_id,
  title,
  evidence_type,        // "url" | "file" | "text"
  evidence_url,         // string | null
  description,          // string | null (used for "text" content too)
  collected_at,         // "YYYY-MM-DD"
  valid_until = null,   // "YYYY-MM-DD" | null
  status = "valid",
  created_by = "ui",
}) {
  const url = `evidence`; // no leading slash
  const json = {
    control_context_link_id: Number(control_context_link_id),
    title,
    description: description ?? null,
    evidence_type,
    evidence_url: evidence_url ?? null,
    file_path: null, // set by /evidence/{id}/artifact
    collected_at,
    valid_until,
    status,
    created_by,
  };
  return postJSON(url, { json });
}

export async function uploadEvidenceArtifact(evidenceId, file) {
  // leading slash ensures proper join with fileClient baseURL
  return uploadFile({
    url: `/evidence/${evidenceId}/artifact`,
    file,
    // meta: { /* optional extra fields */ },
    // onProgress: (p) => console.debug("upload %", p),
  });
}

export async function appendEvidenceLifecycle(evidenceId, body /* {event, note?} */) {
  const url = `evidence/${evidenceId}/lifecycle`;
  return postJSON(url, { json: body });
}

export async function assignRequirementOwner(requirementId, body /* {scope_type?, scope_id?, user_id, role} */) {
  const url = `compliance/requirement/${requirementId}/owners`;
  return postJSON(url, { json: body });
}

// local helper for fetch fallback
async function _safeErr(res) {
  try { return await res.json(); } catch { return { status: res.status, message: res.statusText }; }
}

export async function createException({
  risk_scenario_context_id = null,
  control_id = null,
  framework_requirement_id,
  title,
  description = "",
  reason = "",
  risk_acceptance_ref = "",
  compensating_controls = "",
  requested_by = "ui",
  owner = "",
  start_date,      // "YYYY-MM-DD"
  end_date = null, // "YYYY-MM-DD" | null
  status = "draft"
}) {
  const url = `exceptions`; // no leading slash
  const json = {
    risk_scenario_context_id: Number(risk_scenario_context_id) > 0 ? Number(risk_scenario_context_id) : null,
    control_id: Number(control_id) > 0 ? Number(control_id) : null,
    framework_requirement_id: Number(framework_requirement_id),
    title,
    description,
    reason,
    risk_acceptance_ref,
    compensating_controls,
    requested_by,
    owner,
    start_date,
    end_date,
    status
  };
  return postJSON(url, { json });
}

export async function createCrosswalk({
  framework_requirement_id,
  control_id,
  obligation_atom_id = null,
  relation_type = "implements",
  coverage_level = "partial",
  applicability = {},          // object
  evidence_hint = [],          // array of strings
  rationale = "",
  weight = 100,
  notes = ""
}) {
  const url = `crosswalks`;
  const json = {
    framework_requirement_id: Number(framework_requirement_id),
    control_id: Number(control_id),
    obligation_atom_id: obligation_atom_id != null ? Number(obligation_atom_id) : null,
    relation_type,
    coverage_level,
    applicability: applicability || {},
    evidence_hint: Array.isArray(evidence_hint) ? evidence_hint : [],
    rationale,
    weight: Number.isFinite(Number(weight)) ? Number(weight) : 100,
    notes
  };
  return postJSON(url, { json });
}

