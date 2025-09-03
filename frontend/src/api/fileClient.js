// src/api/fileClient.js
//
// Axios instance for file uploads/downloads.
// - Attaches Authorization from setFileAuthToken() OR localStorage('auth_token')
// - Base URL from VITE_API_BASE or window.__API_BASE__
// - Redirect to /login on 401/403 (except when already on /login)
//

import axios from "axios";

let AUTH_TOKEN = ""; // optional in-memory cache
let API_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8001/";

export function setFileAuthToken(token) {
  AUTH_TOKEN = token || "";
}

export function setFileApiBase(url) {
  if (url) API_BASE = url.endsWith("/") ? url : url + "/";
}

const fileClient = axios.create({
  baseURL: API_BASE, // relative URLs resolve here
  withCredentials: false,
});

// keep base in sync if changed after creation
fileClient.interceptors.request.use((config) => {
  config.baseURL = API_BASE;
  const token = AUTH_TOKEN || (typeof localStorage !== "undefined" && localStorage.getItem("auth_token")) || "";
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function setBaseURL(url) {         // if any code calls setBaseURL on file client
  return setFileApiBase(url);
}
// global 401/403 handler (no loops on /login)
fileClient.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const onLogin = path.startsWith("/login");
    if ((status === 401 ) && !onLogin) {
      try { localStorage.removeItem("auth_token"); } catch {}
      const from = typeof window !== "undefined"
        ? encodeURIComponent(window.location.pathname + window.location.search)
        : "";
      if (typeof window !== "undefined") window.location.assign(`/login?from=${from}`);
    }
    return Promise.reject(error);
  }
);

export default fileClient;

// Convenience helper for multipart upload
export async function uploadFile({ url, file, fields = {}, headers = {} }) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(fields || {}).forEach(([k, v]) => form.append(k, v));
  const resp = await fileClient.post(url, form, {
    headers: { ...(headers || {}), "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}
