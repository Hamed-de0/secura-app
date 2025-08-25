// Lightweight JSON HTTP client built on ky (fetch).
// - Retries, timeouts, aborts
// - Bearer auth (stubbed)
// - Normalized errors
// - limit/offset pagination helper

import ky from "ky";

// ---- Config state ----------------------------------------------------------
let BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
let AUTH_TOKEN = null;
/** Optional async refresh handler that returns a new token or null */
let refreshHandler = null;

// ---- Public setters --------------------------------------------------------
export function setBaseURL(url) {
  BASE_URL = String(url || "").replace(/\/+$/, "");
  api = createKy();
}
export function setAuthToken(token) {
  AUTH_TOKEN = token || null;
}
export function clearAuth() {
  AUTH_TOKEN = null;
}
export function setAuthRefresh(handler /* async () => string|null */) {
  refreshHandler = typeof handler === "function" ? handler : null;
}

// ---- Error normalization ----------------------------------------------------
export class ApiError extends Error {
  constructor(message, { status, code, details, requestId } = {}) {
    super(message || "API Error");
    this.name = "ApiError";
    this.status = status ?? 0;
    this.code = code || "UNKNOWN";
    this.details = details || null;
    this.requestId = requestId || null;
  }
}
async function normalizeError(error, response) {
  try {
    const data = response ? await response.clone().json().catch(() => null) : null;
    const payload = data?.error || data || {};
    const msg =
      payload.message ||
      payload.detail ||
      response?.statusText ||
      error.message ||
      "Request failed";
    return new ApiError(msg, {
      status: response?.status,
      code: payload.code || payload.type || `HTTP_${response?.status || 0}`,
      details: payload.details || payload.errors || null,
      requestId: response?.headers?.get?.("x-request-id") || null,
    });
  } catch (_) {
    return new ApiError(error.message || "Request failed", {
      status: response?.status,
      code: `HTTP_${response?.status || 0}`,
    });
  }
}

// ---- Ky instance factory ----------------------------------------------------
function createKy() {
  return ky.create({
    prefixUrl: BASE_URL,
    timeout: 30_000,
    retry: {
      limit: 2,
      methods: ["get", "head"],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      backoffLimit: 2_000,
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          // Attach auth
          if (AUTH_TOKEN) request.headers.set("Authorization", `Bearer ${AUTH_TOKEN}`);
          // Always accept JSON
          request.headers.set("Accept", "application/json");
          // Only set Content-Type for methods with a body
          const m = request.method ? request.method.toUpperCase() : "GET";
          if (!["GET", "HEAD"].includes(m) && !request.headers.has("Content-Type")) {
            request.headers.set("Content-Type", "application/json");
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401 && refreshHandler && !options.__triedRefresh) {
            const newToken = await refreshHandler().catch(() => null);
            if (newToken) {
              AUTH_TOKEN = newToken;
              return api(request, { ...options, __triedRefresh: true });
            }
          }
          if (response.ok) return response;
          throw await normalizeError(new Error("HTTP error"), response);
        },
      ],
      beforeError: [
        async (error) => {
          if (error instanceof ApiError) return error;
          const resp = error?.response;
          return await normalizeError(error, resp);
        },
      ],
    },
  });
}
let api = createKy();

// ---- Convenience helpers ----------------------------------------------------
export function buildSearchParams({
  limit,
  offset,
  sort,
  sort_dir,
  status,
  q,
  fields,
  filter,
} = {}) {
  const params = new URLSearchParams();
  if (Number.isFinite(limit)) params.set("limit", String(limit));
  if (Number.isFinite(offset)) params.set("offset", String(offset));
  if (q) params.set("q", q);
  if (sort) params.set("sort_by", sort);
  if (sort_dir) params.set("sort_dir", sort_dir === "asc" ? "asc" : "desc");
  if (status) params.set("status", status );
  if (fields) params.set("fields", fields);
  if (filter && typeof filter === "object") {
    for (const [k, v] of Object.entries(filter)) {
      if (v === undefined || v === null) continue;
      params.set(`filter.${k}`, String(v));
    }
  }
  return params;
}

export async function getJSON(path, { searchParams, signal } = {}) {
  const resp = await api.get(path, { searchParams, signal });
  return resp.json();
}
export async function postJSON(path, { json, searchParams, signal, headers } = {}) {
  const resp = await api.post(path, { json, searchParams, signal, headers });
  return resp.json();
}
export async function putJSON(path, { json, searchParams, signal } = {}) {
  const resp = await api.put(path, { json, searchParams, signal });
  return resp.json();
}
export async function patchJSON(path, { json, searchParams, signal } = {}) {
  const resp = await api.patch(path, { json, searchParams, signal });
  return resp.json();
}
export async function deleteJSON(path, { json, searchParams, signal } = {}) {
  const resp = await api.delete(path, { json, searchParams, signal });
  if (resp.status === 204) return { ok: true };
  return resp.json().catch(() => ({ ok: resp.ok }));
}
