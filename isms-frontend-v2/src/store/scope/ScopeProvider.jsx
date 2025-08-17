import React, { createContext, useEffect, useMemo, useState } from 'react';

// shape we’ll use app-wide
export const ScopeContext = createContext({
  scope: { type: 'entity', id: 1 },     // default
  setScope: () => {},
  versions: [],                         // selected framework version ids
  setVersions: () => {},
});

export default function ScopeProvider({ children }) {
  const [scope, setScope] = useState({ type: 'entity', id: 1 });
  const [versions, setVersions] = useState([1, 2]); // sane defaults for now

  // Optional: initialize from mock defaults if present in localStorage (later we’ll read mock file)
  useEffect(() => {
    const s = localStorage.getItem('scope');
    const v = localStorage.getItem('versions');
    if (s) {
      try { setScope(JSON.parse(s)); } catch {}
    }
    if (v) {
      try { setVersions(JSON.parse(v)); } catch {}
    }
  }, []);

  useEffect(() => localStorage.setItem('scope', JSON.stringify(scope)), [scope]);
  useEffect(() => localStorage.setItem('versions', JSON.stringify(versions)), [versions]);

  const value = useMemo(() => ({ scope, setScope, versions, setVersions }), [scope, versions]);

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}
