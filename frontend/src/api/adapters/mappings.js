// Mapping adapters for crosswalks + legacy endpoints.

// Coerce any value to a clean string; join arrays nicely.
function toStr(x) {
  if (x == null) return "";
  if (Array.isArray(x)) return x.filter(Boolean).join(", ");
  return String(x);
}
// Ensure array of strings for hints.
function toStrArray(x) {
  if (x == null) return [];
  if (Array.isArray(x)) return x.map((v) => String(v));
  return [String(x)];
}

/**
 * Normalizes one mapping row.
 * NEW crosswalks/requirements/:id shape example:
 * {
 *   "framework_requirement_id": 176,
 *   "control_id": 96,
 *   "obligation_atom_id": 1,
 *   "relation_type": "satisfies",
 *   "coverage_level": "full",
 *   "applicability": null,
 *   "evidence_hint": ["IR runbook", "Regulator receipt"],
 *   "rationale": "…",
 *   "weight": 100,
 *   "notes": null,
 *   "id": 290,                               // mapping row id (NOT control id)
 *   "control_title": "Internal Control Runbook",
 *   "control_code": "INT_IR_01",
 *   "framework_requirement_title": "…",
 *   "framework_requirement_code": "Art.33",
 *   "obligation_atom_name": "Notify …",
 *   "obligation_atom_code": "Art.33(1)"
 * }
 */
export function adaptMappingItem(x) {
  if (!x) return null;

  // IMPORTANT: do NOT fall back to x.id for control_id (that's mapping id)
  const control_id = Number(x.control_id ?? x.controlId);
  const mapping_id = Number.isFinite(Number(x.id)) ? Number(x.id) : null;

  const requirement_id = Number(
    x.framework_requirement_id ?? x.requirement_id ?? x.req_id
  );

  const control_code = x.control_code ?? x.code ?? "";
  const control_title = x.control_title ?? x.title ?? "";
  const requirement_code =
    x.framework_requirement_code ?? x.requirement_code ?? x.req_code ?? "";
  const requirement_title =
    x.framework_requirement_title ?? x.requirement_title ?? "";

  return {
    // identity
    mapping_id,
    requirement_id,
    control_id,

    // control display (aliases to keep current UI working)
    code: control_code,
    title: control_title,
    control_code,
    control_title,

    // requirement display (useful for reverse views)
    requirement_code,
    requirement_title,

    // weights / semantics
    weight: Number(x.weight ?? x.share ?? 0),
    relation_type: x.relation_type ?? null,
    coverage_level: x.coverage_level ?? null,
    applicability: x.applicability ?? null,

    // obligation atom (GDPR/DORA style)
    obligation_atom_id: x.obligation_atom_id ?? null,
    obligation_atom_code: x.obligation_atom_code ?? null,
    obligation_atom_name: x.obligation_atom_name ?? null,

    // evidence / notes
    evidence_hints: toStrArray(x.evidence_hint),
    rationale: toStr(x.rationale),
    notes: toStr(x.notes),
  };
}

/**
 * Accepts:
 *  - Array (preferred for your crosswalks endpoints)
 *  - { data:[] }
 *  - { items:[] }
 * Returns: array of normalized mapping rows.
 */
export function adaptMappingsResponse(resp) {
  const arr = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.data)
    ? resp.data
    : Array.isArray(resp?.items)
    ? resp.items
    : [];
  return arr.map(adaptMappingItem).filter(Boolean);
}

/**
 * Reverse crosswalk (controls → requirements):
 * Example item:
 * { id, framework_version_id, code, title, text, parent_id, sort_index }
 */
export function adaptRequirementsForControl(resp) {
  const arr = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.data)
    ? resp.data
    : Array.isArray(resp?.items)
    ? resp.items
    : [];
  return arr.map((x) => ({
    requirement_id: Number(x.framework_requirement_id ?? x.id),
    code: x.code ?? "",
    title: x.title ?? "",
    text: x.text ?? "",
    parent_id: x.parent_id ?? null,
    sort_index: x.sort_index ?? null,
    framework_version_id: Number(x.framework_version_id ?? 0),
  }));
}
