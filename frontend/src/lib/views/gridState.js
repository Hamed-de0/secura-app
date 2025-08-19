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
  const set = new Set(allowedColumnIds);
  const vis = (snapshot.columns?.visible || []).filter((id) => set.has(id));
  const ord = (snapshot.columns?.order || []).filter((id) => set.has(id));
  // ensure order contains at least visible items, preserve given order first
  const extraVisible = vis.filter((id) => !ord.includes(id));
  safe.columns = { visible: vis, order: [...ord, ...extraVisible] };
  // guard pagination
  const sz = Number(snapshot.pagination?.pageSize || 10);
  safe.pagination = { pageSize: [10, 25, 50, 100].includes(sz) ? sz : 10 };
  // guard density
  safe.density = ['compact', 'standard', 'comfortable'].includes(snapshot.density)
    ? snapshot.density
    : 'standard';
  // ensure sort is an array
  safe.sort = Array.isArray(snapshot.sort) ? snapshot.sort : [];
  // ensure filters is an object
  safe.filters = typeof snapshot.filters === 'object' && snapshot.filters !== null ? snapshot.filters : {};
  return safe;
}