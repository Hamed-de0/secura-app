// src/api/services/evidence.js
// Generic evidence lifecycle helpers (non-context specific)
import { getJSON } from '../../api/httpClient';

// Fetch lifecycle events for a given evidence item
// GET '/evidence/{evidenceId}/lifecycle/' (trailing slash required)
export async function fetchEvidenceLifecycle(evidenceId) {
  if (!evidenceId) return [];
  const url = `evidence/${evidenceId}/lifecycle/`;
  const resp = await getJSON(url);
  return Array.isArray(resp) ? resp : [];
}

