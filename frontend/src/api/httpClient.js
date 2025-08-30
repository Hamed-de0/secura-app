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


function toReadableApiError(respBody, status) {
  // FastAPI 422 shape: { detail: [{loc: [...], msg: "", type: ""}, ...] }
  if (status === 422 && respBody?.detail) {
    const msgs = respBody.detail.map(d => `${d.msg} at ${d.loc?.join(' > ')}`).join(' | ');
    return new Error(`422 Unprocessable Content: ${msgs}`);
  }
  return new Error(respBody?.message || `HTTP ${status}`);
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

// src/api/httpClient.js
// Replace your buildSearchParams with this version

export function buildSearchParams(obj = {}) {
  const params = new URLSearchParams();

  const {
    // common list/paging/sorting
    limit, offset, page, size, sort, sort_dir, q, status, fields,
    // compliance-specific
    version_id, scope_type, scope_id, within_days, ancestor_id,
    // optional structured filters (object)
    filter,
    // anything else → pass through
    ...rest
  } = obj;

  // paging/sorting
  if (Number.isFinite(limit)) params.set("limit", String(limit));
  if (Number.isFinite(offset)) params.set("offset", String(offset));
  if (Number.isFinite(page))  params.set("page",  String(page));
  if (Number.isFinite(size))  params.set("size",  String(size));
  if (q)       params.set("q", q);
  if (sort)    params.set("sort_by", sort);
  if (sort_dir)params.set("sort_dir", sort_dir === "asc" ? "asc" : "desc");

  // list-y things can be string or array
  if (status) params.set("status", Array.isArray(status) ? status.join(",") : status);
  if (fields) params.set("fields", Array.isArray(fields) ? fields.join(",") : fields);

  // compliance keys (required by backend)
  if (version_id != null) params.set("version_id", String(version_id));
  if (scope_type)         params.set("scope_type", scope_type);
  if (scope_id != null)   params.set("scope_id", String(scope_id));

  // other useful keys we use
  if (within_days != null) params.set("within_days", String(within_days));
  if (ancestor_id != null) params.set("ancestor_id", String(ancestor_id));

  // filter.{k}=v (object)
  if (filter && typeof filter === "object") {
    for (const [k, v] of Object.entries(filter)) {
      if (v === undefined || v === null || v === "") continue;
      params.set(`filter.${k}`, Array.isArray(v) ? v.join(",") : String(v));
    }
  }

  // pass-through any remaining primitives/arrays (safe default)
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, Array.isArray(v) ? v.join(",") : String(v));
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
