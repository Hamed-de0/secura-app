import React, { createContext, useEffect, useMemo, useState, useCallback } from "react";

// Canonical default (matches backend /scopes/types)
const DEFAULT_SCOPE = { type: "org", id: 1 };
const VERSION_LS_KEY = "compliance.versionId";
const SCOPE_LS_KEY   = "compliance.scope";

// Public shape we’ll use app-wide
export const ScopeContext = createContext({
  scope: DEFAULT_SCOPE,                // { type: 'org', id: 1 }
  setScope: () => {},
  versionId: 1,                        // single selected framework version
  setVersionId: () => {},
});

function normalizeScopeType(t) {
  if (!t) return DEFAULT_SCOPE.type;
  const k = String(t).trim();
  // map legacy synonyms -> canonical keys used by backend (/scopes/types)
  if (k === "org_group" || k === "orgGroup" || k === "org" ) return "org";
  if (k === "asset_tag" || k === "tag")      return "tag";
  return k;
}

export default function ScopeProvider({ children }) {
  const [scope, _setScope] = useState(DEFAULT_SCOPE);
  const [versionId, _setVersionId] = useState(1);

  // one safe setter that enforces canonical keys & numeric IDs
  const setScope = useCallback((next) => {
    _setScope((prev) => {
      const type = normalizeScopeType(next?.type ?? prev.type);
      const idNum = Number(next?.id ?? prev.id);
      return { type, id: Number.isFinite(idNum) ? idNum : DEFAULT_SCOPE.id };
    });
  }, []);

  const setVersionId = useCallback((id) => {
    const n = Number(id);
    _setVersionId(Number.isFinite(n) ? n : 1);
  }, []);

  // ---- First load: migrate any old localStorage keys ----
  useEffect(() => {
    try {
      // New keys
      const s = localStorage.getItem(SCOPE_LS_KEY);
      const v = localStorage.getItem(VERSION_LS_KEY);

      // Legacy keys (from your mock)
      const legacyScope = localStorage.getItem("scope");
      const legacyVersions = localStorage.getItem("versions"); // array

      // Scope
      if (s) {
        const parsed = JSON.parse(s);
        setScope({ type: parsed.type, id: parsed.id });
      } else if (legacyScope) {
        const parsed = JSON.parse(legacyScope);
        setScope({ type: parsed.type, id: parsed.id });
      } else {
        setScope(DEFAULT_SCOPE);
      }

      // VersionId
      if (v) {
        setVersionId(JSON.parse(v));
      } else if (legacyVersions) {
        // pick first from legacy array to keep UX stable
        const arr = JSON.parse(legacyVersions);
        const first = Array.isArray(arr) && arr.length ? Number(arr[0]) : 1;
        setVersionId(first);
      } else {
        setVersionId(1);
      }
    } catch {
      setScope(DEFAULT_SCOPE);
      setVersionId(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist with new keys only
  useEffect(() => {
    localStorage.setItem(SCOPE_LS_KEY, JSON.stringify(scope));
  }, [scope]);
  useEffect(() => {
    localStorage.setItem(VERSION_LS_KEY, JSON.stringify(versionId));
  }, [versionId]);

  const value = useMemo(
    () => ({ scope, setScope, versionId, setVersionId }),
    [scope, setScope, versionId, setVersionId]
  );

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}
