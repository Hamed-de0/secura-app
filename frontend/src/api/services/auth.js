// Uses your getJSON/postJSON helpers (no leading '/')
import { getJSON, postJSON } from "../httpClient"; // adjust path if different

export async function apiLogin({ identifier, password }) {
  const body = identifier.includes("@")
    ? { email: identifier, password }
    : { user_name: identifier, password };
  return postJSON(`auth/login`, { json: body }); // -> { access_token }
}

export async function apiMe() {
  return getJSON(`auth/me`); // -> { user, person?, permissions: [] }
}
