// Minimal exceptions service helpers (read-only)
import { getJSON, buildSearchParams } from '../../api/httpClient';

/** List exceptions with optional filters. Trailing slash preserved. */
export async function fetchExceptions(params = {}) {
  const searchParams = buildSearchParams({ ...params });
  return await getJSON('exceptions/', { searchParams });
}

/** Fetch a single exception by id. */
export async function fetchException(excId) {
  if (!excId) return null;
  return await getJSON(`exceptions/${excId}/`);
}

