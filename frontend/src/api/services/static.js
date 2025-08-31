// src/api/services/static.js
import { getJSON } from "../httpClient";

export async function fetchFrameworkVersions() {
  // already live per your answer
  const url = `/framework_versions/?offset=0&limit=50&sort_by=framework_name&sort_dir=asc`;
  return getJSON(url);
}

export async function fetchScopeTypes() {
  return getJSON(`/scopes/types`);
}
