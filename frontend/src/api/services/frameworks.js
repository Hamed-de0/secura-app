// Service to read framework versions for the mapping UI.
// Endpoint: GET /framework_versions/
// Your backend returns an array like:
// [
//   { "version_id": 1, "framework_id": 2, "version_label": "2022", "framework_name": "ISO/IEC 27001" },
//   { "version_id": 4, "framework_id": 3, "version_label": "Regulation (EU) 2016/679", "framework_name": "GDPR" },
//   ...
// ]
//
// We normalize to: { id, code, name, version_code }

import { getJSON } from "../httpClient";

function pickArray(resp) {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.data)) return resp.data;
  if (Array.isArray(resp?.items)) return resp.items;
  return [];
}

// Short codes for known frameworks (used in the dropdown)
const CODE_MAP = new Map([
  ["ISO/IEC 27001", "ISO27001"],
  ["GDPR", "GDPR"],
  ["DORA", "DORA"],
  ["NIS2", "NIS2"],
  ["BSI Grundschutz", "BSI"],
]);

function toShortCode(name) {
  if (!name) return "";
  const mapped = CODE_MAP.get(name);
  if (mapped) return mapped;
  // Fallback: keep letters/numbers, collapse spaces, uppercase
  return String(name).replace(/[^A-Za-z0-9]+/g, "").toUpperCase().slice(0, 12);
}

function adaptVersion(x) {
  if (!x) return null;
  const id = Number(x.version_id ?? x.id ?? x.framework_version_id);
  const name = x.framework_name ?? x.name ?? "";
  const version_code = x.version_label ?? x.version ?? "";
  const code = toShortCode(name);
  return { id, code, name, version_code };
}

export async function listFrameworkVersions() {
  const resp = await getJSON("framework_versions/?order_by=id&order_dir=asc"); // trailing slash matters for your backend
  return pickArray(resp).map(adaptVersion).filter(Boolean);
}
