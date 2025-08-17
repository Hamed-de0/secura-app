// src/lib/url/scopeUrl.js
export function parseScopeParam(str) {
  if (!str || !str.includes(':')) return null;
  const [type, idStr] = str.split(':');
  const id = Number(idStr);
  if (!type || Number.isNaN(id)) return null;
  return { type, id };
}

export function serializeScope(scope) {
  if (!scope?.type || scope?.id == null) return '';
  return `${scope.type}:${scope.id}`;
}

export function parseVersionsParam(str) {
  if (!str) return [];
  return Array.from(
    new Set(
      str.split(',').map(s => Number(s)).filter(n => Number.isInteger(n))
    )
  ).sort((a,b) => a - b);
}

export function serializeVersions(arr) {
  if (!arr?.length) return '';
  const uniq = Array.from(new Set(arr)).filter(n => Number.isInteger(n)).sort((a,b)=>a-b);
  return uniq.join(',');
}
