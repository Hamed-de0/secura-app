// src/api/httpClient.js

let AUTH_TOKEN = "";
let API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8001/";

export function setAuthToken(token) {
  AUTH_TOKEN = token || "";
}
export function setApiBase(url) {
  if (url) API_BASE = url.endsWith("/") ? url : url + "/";
}

// export function buildSearchParams(params = {}) {
//   const out = {};
//   Object.entries(params).forEach(([k, v]) => {
//     if (v === undefined || v === null || v === "") return;
//     out[k] = v;
//   });
//   return out;
// }

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


export function setBaseURL(url) {         // old name used around the app
  return setApiBase(url);
}
export function getBaseURL() {
  return API_BASE;
}

function isAbsolute(url) {
  return /^https?:\/\//i.test(url);
}
function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  if (base.endsWith("/") && path.startsWith("/")) return base + path.slice(1);
  if (!base.endsWith("/") && !path.startsWith("/")) return base + "/" + path;
  return base + path;
}
export function buildUrl(url, searchParams) {
  const abs = isAbsolute(url) ? url : joinUrl(API_BASE, url);
  if (!searchParams) return abs;
  const u = new URL(abs);
  
    // Accept both URLSearchParams and plain objects
  if (typeof URLSearchParams !== "undefined" && searchParams instanceof URLSearchParams) {
    const qs = searchParams.toString();
    if (qs) u.search = qs; // replace entire query string
    return u.toString();
  }

  // Plain object: set or append (arrays → repeated keys)
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((vv) => {
        if (vv === undefined || vv === null || vv === "") return;
        u.searchParams.append(k, String(vv));
      });
    } else {
      u.searchParams.set(k, String(v));
    }
  });
  
  return u.toString();
}

function authHeaders(fullUrl, headers) {
  const h = new Headers(headers || {});
  const token = AUTH_TOKEN || (typeof localStorage !== "undefined" && localStorage.getItem("auth_token")) || "";

  // robustly get the path to decide skipping
  let path = "";
  try { path = new URL(fullUrl, window.location.origin).pathname; } catch { path = String(fullUrl); }

  // only skip for login/register (NOT /auth/me)
  const skipAuth = path === "/auth/login" || path === "/auth/register";

  if (token && !skipAuth && !h.has("Authorization")) {
    h.set("Authorization", `Bearer ${token}`);
  }
  if (!h.has("Accept")) h.set("Accept", "application/json");
  return h;
}

async function handleJsonResponse(res) {
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  if (res.ok) return isJson ? await res.json() : await res.text();

  let data = null;
  try { data = isJson ? await res.json() : await res.text(); } catch {}
  const detail =
    (data && (data.detail || data.message)) ||
    (typeof data === "string" ? data : res.statusText);
  const err = new Error(detail || `HTTP ${res.status}`);
  err.status = res.status;
  err.detail = detail;
  err.data = data;
  throw err;
}

export async function getJSON(url, { searchParams, headers, ...init } = {}) {
  const full = buildUrl(url, searchParams);
  const h = authHeaders(full, headers); // pass full URL here
  const res = await fetch(full, { method: "GET", headers: h, ...init });
  return handleJsonResponse(res);
}
export async function postJSON(url, { json, searchParams, headers, ...init } = {}) {
  const full = buildUrl(url, searchParams);
  const h = authHeaders(full, headers);
  if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
  const res = await fetch(full, {
    method: "POST",
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...init,
  });
  return handleJsonResponse(res);
}
export async function putJSON(url, { json, searchParams, headers, ...init } = {}) {
  const full = buildUrl(url, searchParams);
  const h = authHeaders(full, headers);
  if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
  const res = await fetch(full, {
    method: "PUT",
    headers: h,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...init,
  });
  return handleJsonResponse(res);
}
export async function deleteJSON(url, { searchParams, headers, ...init } = {}) {
  const full = buildUrl(url, searchParams);
  const h = authHeaders(full, headers);
  const res = await fetch(full, { method: "DELETE", headers: h, ...init });
  return handleJsonResponse(res);
}
