// Configure the generated API client base URL at runtime
// Import this file once at app startup (e.g., in main.jsx)
import { OpenAPI } from './index';

// Prefer VITE_API_BASE_URL for consistency with the rest of the app
// Fallback to local dev server when not provided
const base = (import.meta as any).env?.VITE_API_BASE_URL
  || (import.meta as any).env?.VITE_API_BASE
  || 'http://127.0.0.1:8001';

OpenAPI.BASE = base;

