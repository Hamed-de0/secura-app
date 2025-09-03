// src/api/httpAuthPatch.js
//
// Optional fetch patch to redirect on 401/403 for plain fetch calls
// that don't go through httpClient. Safe on /login and /auth/*.
//

export function installAuthFetch() {
  if (window.__authFetchInstalled) return;
  window.__authFetchInstalled = true;

  const origFetch = window.fetch;
  window.fetch = async (input, init = {}) => {
    const req = new Request(input, init);
    const abs = new URL(req.url, window.location.origin);
    const isAuthAPI = abs.pathname.startsWith("/auth/");
    const isLoginPage = window.location.pathname.startsWith("/login");
    // console.log("fetch", req.method, abs.pathname, { req });
    const resp = await origFetch(req);

    if (!isAuthAPI && !isLoginPage && (resp.status === 401 )) {
      try { localStorage.removeItem("auth_token"); } catch {}
      const from = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?from=${from}`);
    }
    return resp;
  };
}
