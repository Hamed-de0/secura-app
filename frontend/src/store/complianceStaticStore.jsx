import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getJSON } from "../api/httpClient";

const Ctx = createContext({ versions: [], scopes: [], loading: true, error: null, refresh: () => {} });


export function ComplianceStaticProvider({ children }) {
  const [versions, setVersions] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mapVersion = (x) => ({
    versionId: x.version_id,
    frameworkId: x.framework_id,
    title: `${x.framework_name}${x.version_label ? ` ${x.version_label}` : ""}`,
    frameworkName: x.framework_name,
    versionLabel: x.version_label,
  });
  
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const v = await getJSON("framework_versions/?offset=0&limit=50&sort_by=framework_name&sort_dir=asc");
      setVersions((Array.isArray(v) ? v : []).map(mapVersion));
      try {
        const s = await getJSON("scopes/types");
        setScopes(Array.isArray(s) ? s : []);
      } catch { /* optional */ }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const value = useMemo(() => ({ versions, scopes, loading, error, refresh: load }), [versions, scopes, loading, error]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useComplianceStatic() {
  return useContext(Ctx);
}

export default ComplianceStaticProvider;
