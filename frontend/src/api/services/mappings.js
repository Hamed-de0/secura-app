// Mappings service: read from your crosswalk endpoints; keep bulk-save until you share write path.
//
// READ (real):
//   GET crosswalks/requirements/:requirement_id        -> mappings for a requirement (now enriched)
//   GET crosswalks/controls/:control_id                -> requirements using a control
//
// WRITE (temporary until you provide a crosswalk write endpoint):
//   PUT /mappings?version_id&requirement_id            body: { items:[{control_id,weight}] }

import { getJSON, putJSON, buildSearchParams, postJSON, deleteJSON } from "../httpClient";
import { adaptMappingsResponse, adaptRequirementsForControl, adaptMappingItem } from "../adapters/mappings";

/** Load mapping rows for one requirement (enriched: control_code/title, obligation_atom, etc.) */
export async function getRequirementMappings({ requirement_id }) {
  if (!requirement_id) throw new Error("requirement_id is required");
  // trailing slash usually tolerated; include if your server expects it
  const resp = await getJSON(`crosswalks/requirements/${requirement_id}`);
  return adaptMappingsResponse(resp);
}

/** Reverse crosswalk: list requirements that use a specific control */
export async function getControlCrosswalk({ control_id }) {
  if (!control_id) throw new Error("control_id is required");
  const resp = await getJSON(`crosswalks/controls/${control_id}`);
  return adaptRequirementsForControl(resp);
}

/**
 * Replace mapping pairs (bulk). Returns saved set (adapted).
 * NOTE: Still using /mappings until a /crosswalks write endpoint is provided.
 */
export async function saveRequirementMappings({ version_id, requirement_id, items }) {
  if (!version_id) throw new Error("version_id is required");
  if (!requirement_id) throw new Error("requirement_id is required");
  const params = buildSearchParams({ version_id, requirement_id });
  const resp = await putJSON("mappings", { searchParams: params, json: { items: items || [] } });
  return adaptMappingsResponse(resp);
}

/**
 * Create one crosswalk row.
 * payload: {
 *   framework_requirement_id, control_id, weight,
 *   obligation_atom_id?, relation_type?, coverage_level?,
 *   applicability?, evidence_hint?, rationale?, notes?
 * }
 * Returns the created/normalized row if API echoes it, otherwise null.
 */
/** POST /crosswalks — create one mapping */
export async function createCrosswalkMapping(payload, { idempotencyKey } = {}) {
  const body = {};
  for (const [k, v] of Object.entries(payload || {})) if (v !== undefined) body[k] = v;
  const headers = idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined;
  const resp = await postJSON("crosswalks", { json: body, headers });
  // Try to adapt a single row if backend echoes it; otherwise return null
  const row = Array.isArray(resp) ? resp[0] : resp;
  try { return adaptMappingItem(row); } catch { return null; }
}

/**
 * Delete a crosswalk row.
 * Prefer DELETE /crosswalks/:mapping_id
 * Fallback: DELETE /crosswalks?framework_requirement_id=&control_id=&obligation_atom_id=
 */
export async function deleteCrosswalkMapping({ mapping_id, framework_requirement_id, control_id, obligation_atom_id } = {}) {
  if (mapping_id) {
    return deleteJSON(`crosswalks/${mapping_id}`);
  }
  const searchParams = new URLSearchParams();
  if (framework_requirement_id != null) searchParams.set("framework_requirement_id", String(framework_requirement_id));
  if (control_id != null) searchParams.set("control_id", String(control_id));
  if (obligation_atom_id != null) searchParams.set("obligation_atom_id", String(obligation_atom_id));
  return deleteJSON("crosswalks", { searchParams });
}

/** PUT /crosswalks/:mapping_id — update one mapping; fallback to DELETE+POST if 404/405 */
export async function updateCrosswalkMapping(mapping_id, partial) {
  if (!mapping_id) throw new Error("mapping_id required");
  const body = {};
  for (const [k, v] of Object.entries(partial || {})) if (v !== undefined) body[k] = v;

  try {
    const resp = await putJSON(`crosswalks/${mapping_id}`, { json: body });
    const row = Array.isArray(resp) ? resp[0] : resp;
    return adaptMappingItem(row);
  } catch (e) {
    // If PATCH not supported, fallback: delete + create
    if (e.status === 404 || e.status === 405) {
      // Need requirement_id + control_id to recreate
      const reqId = partial.framework_requirement_id;
      const ctlId = partial.control_id;
      console.log('error on update', reqId, ctlId, partial);
      // if (!reqId || !ctlId) throw e;
      // await deleteJSON(`crosswalks/${mapping_id}`);
      // return createCrosswalkMapping(partial);
    }
    throw e;
  }
}
