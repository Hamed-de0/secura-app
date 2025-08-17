// src/lib/mock/useRbac.js
// Lightweight hooks (no React Query needed for static mock).

import { useMemo } from 'react';
import { getMe, getEffectivePermissions, searchScopes, getScopeParents, getMenuCaps, getFrameworkVersions } from './rbacClient';


export function useMe() {
  // static mock: compute once
  const info = useMemo(() => getMe(), []);
  return { data: info };
}

export function useEffectiveCaps(scope) {
  const res = useMemo(() => {
    if (!scope) return { effective_role: 'Viewer', caps: [] };
    return getEffectivePermissions(scope.type, scope.id);
  }, [scope?.type, scope?.id]);
  return { data: res };
}

export function useScopeSearch(query, type) {
  const res = useMemo(() => searchScopes(query, type), [query, type]);
  return { data: res };
}

export function useScopeParents(scope) {
  const res = useMemo(() => {
    if (!scope) return [];
    return getScopeParents(scope.type, scope.id);
  }, [scope?.type, scope?.id]);
  return { data: res };
}

export function useMenuCaps() {
  const res = useMemo(() => getMenuCaps(), []);
  return { data: res };
}

export function useFrameworkVersions() {
  const res = useMemo(() => getFrameworkVersions(), []);
  return { data: res };
}


