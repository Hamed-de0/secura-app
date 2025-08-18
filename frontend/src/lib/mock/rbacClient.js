// src/lib/mock/rbacClient.js
// Minimal synchronous client over the mock JSON.

import data from '../../mock/identity_scopes.json';

const idxByKey = new Map(
  data.scopes_index.map(s => [`${s.type}:${s.id}`, s])
);

function scopeKey(type, id) {
  return `${type}:${id}`;
}

export function getMe() {
  return {
    user: data.user,
    orgs: data.orgs,
    assignments: data.assignments,
    roles: data.roles,
  };
}

export function getRoleCaps(role) {
  return data.role_caps[role] || [];
}

export function getEffectivePermissions(scopeType, scopeId) {
  const key = scopeKey(scopeType, scopeId);
  let eff = data.effective_permissions.find(e => e.scope_key === key);

  // Safe fallback: if not found, try to inherit from nearest known parent
  if (!eff) {
    const parents = data.scope_parents[key] || [];
    eff = parents
      .map(k => data.effective_permissions.find(e => e.scope_key === k))
      .filter(Boolean)
      .at(-1);
  }

  if (!eff) {
    // ultimate fallback to default org group if present
    const def = `org_group:${data.user.default_org_group_id}`;
    eff = data.effective_permissions.find(e => e.scope_key === def);
  }

  // Resolve "@role_caps.RoleName" indirections if present
  let caps = eff?.caps || [];
  if (typeof caps === 'string' && caps.startsWith('@role_caps.')) {
    const role = caps.split('.').pop();
    caps = getRoleCaps(role);
  }

  return {
    scope_key: eff?.scope_key,
    effective_role: eff?.effective_role || 'Viewer',
    caps,
    derived_from: eff?.derived_from || [],
  };
}

export function searchScopes(query, type) {
  const q = (query || '').toLowerCase().trim();
  const match = (s) =>
    !q ||
    s.label.toLowerCase().includes(q) ||
    (s.aliases || []).some(a => a.toLowerCase().includes(q));

  return data.scopes_index
    .filter(s => (!type || s.type === type) && match(s))
    .slice(0, 25);
}

export function getScopeParents(scopeType, scopeId) {
  const key = scopeKey(scopeType, scopeId);
  const parents = data.scope_parents[key] || [];
  return parents.map(k => {
    const s = idxByKey.get(k);
    return s ? { key: k, ...s } : { key: k };
  });
}

export function getMenuCaps() {
  return data.menu_caps || {};
}


export function getScopeLabel(scopeType, scopeId) {
 const key = `${scopeType}:${scopeId}`;
 const found = data.scopes_index.find(s => s.type === scopeType && s.id === scopeId);
 return found ? found.label : key;
}

export function getFrameworkVersions() {
  return data.framework_versions || [];
}