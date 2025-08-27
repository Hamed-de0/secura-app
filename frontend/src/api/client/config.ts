// Configure the generated API client base URL at runtime
// Import this file once at app startup (e.g., in main.jsx)
import { OpenAPI } from './index';

// Prefer env var, fallback to local dev server
OpenAPI.BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8001';

