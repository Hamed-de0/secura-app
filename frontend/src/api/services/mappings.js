// Mappings service: read from your crosswalk endpoints; keep bulk-save until you share write path.
//
// READ (real):
//   GET crosswalks/requirements/:requirement_id        -> mappings for a requirement (now enriched)
//   GET crosswalks/controls/:control_id                -> requirements using a control
//
// WRITE (temporary until you provide a crosswalk write endpoint):
//   PUT /mappings?version_id&requirement_id            body: { items:[{control_id,weight}] }

import { getJSON, putJSON, buildSearchParams } from "../httpClient";
import { adaptMappingsResponse, adaptRequirementsForControl } from "../adapters/mappings";

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
