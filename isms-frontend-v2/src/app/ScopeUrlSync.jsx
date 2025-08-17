import React, { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScopeContext } from '../store/scope/ScopeProvider.jsx';
import { parseScopeParam, serializeScope, parseVersionsParam, serializeVersions } from '../lib/url/scopeUrl';

export default function ScopeUrlSync() {
  const [params, setParams] = useSearchParams();
  const { scope, setScope, versions, setVersions } = useContext(ScopeContext);

  // On mount: read URL → store (if present)
  useEffect(() => {
    const pScope = parseScopeParam(params.get('scope'));
    const pVersions = parseVersionsParam(params.get('versions'));
    if (pScope) setScope((cur) => (cur?.type === pScope.type && cur?.id === pScope.id ? cur : pScope));
    if (pVersions.length) setVersions((cur) => (sameArray(cur, pVersions) ? cur : pVersions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // When store changes: push to URL if different
  useEffect(() => {
    const current = new URLSearchParams(params);
    const wantScope = serializeScope(scope);
    const wantVers = serializeVersions(versions);

    const curScope = current.get('scope') || '';
    const curVers = current.get('versions') || '';

    if (wantScope !== curScope || wantVers !== curVers) {
      if (wantScope) current.set('scope', wantScope); else current.delete('scope');
      if (wantVers) current.set('versions', wantVers); else current.delete('versions');
      setParams(current, { replace: true });
    }
  }, [scope?.type, scope?.id, versions, params, setParams]);

  return null;
}

function sameArray(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i=0; i<a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
