// src/lib/api/params.js
export function scopeParams(scope) {
  if (!scope?.type || scope?.id == null) throw new Error('scope is required');
  return { scope_type: scope.type, scope_id: scope.id };
}

export function versionIdsParam(arr = []) {
  const ids = Array.from(new Set(arr)).filter(Number.isInteger).sort((a,b)=>a-b);
  return ids.join(',');
}
