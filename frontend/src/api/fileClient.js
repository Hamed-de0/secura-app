// Dedicated client for file upload/download with progress (axios).
// Keep axios *only* here; use ky/fetch for the rest.

import axios from "axios";

let BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
let AUTH_TOKEN = null;

export function setFileBaseURL(url) {
  BASE_URL = String(url || "").replace(/\/+$/, "");
  instance = createInstance();
}
export function setFileAuthToken(token) {
  AUTH_TOKEN = token || null;
  instance.defaults.headers.common["Authorization"] = AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : undefined;
}

function createInstance() {
  const inst = axios.create({
    baseURL: BASE_URL,
    timeout: 5 * 60 * 1000, // 5 minutes for big files
    withCredentials: false,
  });
  inst.interceptors.request.use((config) => {
    if (AUTH_TOKEN) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }
    return config;
  });
  return inst;
}

let instance = createInstance();

/**
 * Upload a single file with optional metadata.
 * @param {Object} opts
 * @param {string} opts.url - endpoint path (e.g., "/files/upload")
 * @param {File|Blob} opts.file
 * @param {Object} [opts.meta] - JSON metadata merged into form
 * @param {(p:number)=>void} [opts.onProgress] - 0..100
 */
export async function uploadFile({ url, file, meta = {}, onProgress }) {
  const form = new FormData();
  form.append("file", file);
  for (const [k, v] of Object.entries(meta || {})) form.append(k, String(v));

  const resp = await instance.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (!onProgress || !e.total) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    },
  });
  return resp.data;
}

/**
 * Download a file as Blob; optionally auto-save.
 * @param {Object} opts
 * @param {string} opts.url - endpoint path (e.g., "/files/export.csv")
 * @param {Object} [opts.params]
 * @param {(p:number)=>void} [opts.onProgress]
 * @param {string} [opts.saveAs] - if provided, auto-saves with this file name
 * @returns {Promise<Blob>}
 */
export async function downloadFile({ url, params, onProgress, saveAs }) {
  const resp = await instance.get(url, {
    params,
    responseType: "blob",
    onDownloadProgress: (e) => {
      if (!onProgress || !e.total) return;
      const pct = Math.round((e.loaded / e.total) * 100);
      onProgress(pct);
    },
  });

  const blob = resp.data;
  if (saveAs) {
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = saveAs;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }
  return blob;
}
