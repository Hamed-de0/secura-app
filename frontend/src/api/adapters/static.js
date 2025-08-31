// src/api/adapters/static.js
export function adaptFrameworkVersions(list = []) {
  return list.map(x => ({
    versionId: x.version_id,
    frameworkId: x.framework_id,
    label: `${x.framework_name} ${x.version_label}`.trim(),
    frameworkName: x.framework_name,
    versionLabel: x.version_label,
  }));
}

export function adaptScopeTypes(list = []) {
  // ensure stable sort by order; provide sensible fallback titles if missing
  return [...list]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map(x => ({
      scopeType: x.scope_type,
      title: x.title || x.scope_type,
      order: x.order ?? 999,
    }));
}
