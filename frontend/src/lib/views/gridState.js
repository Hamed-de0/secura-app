export const SNAPSHOT_VERSION = 1;

export function makeDefaultSnapshot({
  columns = { visible: [], order: [] },
  sort = [],
  pagination = { pageSize: 10 },
  density = 'standard',
  filters = {},
} = {}) {
  return {
    ver: SNAPSHOT_VERSION,
    columns,
    sort,
    pagination,
    density,
    filters,
  };
}

export function mergeSnapshot(base, override) {
  const out = { ...base };
  if (!override) return out;
  if (override.ver) out.ver = override.ver;
  if (override.columns) {
    out.columns = {
      visible: override.columns.visible ?? base.columns.visible,
      order: override.columns.order ?? base.columns.order,
    };
  }
  if (override.sort) out.sort = override.sort;
  if (override.pagination) {
    out.pagination = { ...base.pagination, ...override.pagination };
  }
  if (override.density) out.density = override.density;
  if (override.filters) out.filters = { ...base.filters, ...override.filters };
  return out;
}

export function sanitizeSnapshot(snapshot, allowedColumnIds = []) {
  const safe = { ...snapshot };
  const allowAll = !allowedColumnIds || allowedColumnIds.length === 0;
  const allowed = new Set(allowedColumnIds || []);

  // columns: drop unknowns, repair order (preserve given order first)
  const visSrc = Array.isArray(snapshot.columns?.visible) ? snapshot.columns.visible : [];
  const ordSrc = Array.isArray(snapshot.columns?.order) ? snapshot.columns.order : [];
  const vis = visSrc.filter((id) => allowAll || allowed.has(id));
  const ord = ordSrc.filter((id) => allowAll || allowed.has(id));
  const extraVisible = vis.filter((id) => !ord.includes(id));
  safe.columns = { visible: vis, order: [...ord, ...extraVisible] };

  // sort: keep only valid items and valid fields
  const sortSrc = Array.isArray(snapshot.sort) ? snapshot.sort : [];
  safe.sort = sortSrc.filter(
    (s) =>
      s &&
      typeof s.field === 'string' &&
      (s.sort === 'asc' || s.sort === 'desc') &&
      (allowAll || allowed.has(s.field))
  );

  // pagination: keep to allowed set (project standard)
  const sz = Number(snapshot.pagination?.pageSize || 10);
  safe.pagination = { pageSize: [10, 25, 50, 100].includes(sz) ? sz : 10 };

  // density
  safe.density = ['compact', 'standard', 'comfortable'].includes(snapshot.density)
    ? snapshot.density
    : 'standard';

  // filters: ensure an object
  safe.filters = typeof snapshot.filters === 'object' && snapshot.filters !== null ? snapshot.filters : {};

  return safe;
}
