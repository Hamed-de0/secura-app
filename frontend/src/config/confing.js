// Central app config. Prefer env vars with sensible defaults.
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL) || 'http://127.0.0.1:8001';

const config = {
  API_BASE_URL,
};

export default config;
