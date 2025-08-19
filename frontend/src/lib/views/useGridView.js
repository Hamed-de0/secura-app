import * as React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { makeDefaultSnapshot, mergeSnapshot, sanitizeSnapshot } from './gridState';
import { parseViewParam, serializeViewParam } from './urlParam';
import { listSavedViews, saveView, getDefaultView, setDefaultView, getDefaultViewId } from './storage';

/**
 * useGridView — single source of truth for persisted/sharable grid & filter state
 *
 * @param {Object} opts
 *  - key: stable route key (e.g., 'controls/effective@v1')
 *  - defaults: snapshot default (from feature preset)
 *  - filterSchema: object of default filter values (e.g., { q: '', status: null })
 *  - columnIds: array of allowed column ids for sanitization
 *  - syncQueryParamQ?: if true, mirror filters.q <-> URL ?q= for backward compat
 */
export default function useGridView({ key, defaults, filterSchema = {}, columnIds = [], syncQueryParamQ = false }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 1) establish base snapshot from defaults
  const base = React.useMemo(() => makeDefaultSnapshot({
    columns: defaults?.columns || { visible: [], order: [] },
    sort: defaults?.sort || [],
    pagination: defaults?.pagination || { pageSize: 10 },
    density: defaults?.density || 'standard',
    filters: { ...(defaults?.filters || {}), ...filterSchema },
  }), [defaults, filterSchema]);

  // 2) try URL v= param
  const urlSnapshot = React.useMemo(() => sanitizeSnapshot(
    mergeSnapshot(base, parseViewParam(searchParams.get('v')) || null),
    columnIds
  ), [base, columnIds, searchParams]);

  // 3) fallback to default saved view
  const defaultSaved = React.useMemo(() => {
    const snap = getDefaultView(key);
    return sanitizeSnapshot(mergeSnapshot(base, snap || null), columnIds);
  }, [base, key, columnIds]);

  const initial = searchParams.get('v') ? urlSnapshot : defaultSaved;
  const [snapshot, setSnapshot] = React.useState(initial);

  // sync ?q= legacy param with filters.q if requested
  React.useEffect(() => {
    if (!syncQueryParamQ) return;
    const q = searchParams.get('q') ?? '';
    setSnapshot((s) => ({ ...s, filters: { ...s.filters, q } }));
    // do not push q from state to URL here; we only read it at load time
  }, []); // eslint-disable-line

  // binders for MUI DataGrid
  const sortingModel = snapshot.sort;
  const onSortingModelChange = (model) => setSnapshot((s) => ({ ...s, sort: model }));

  const columnVisibilityModel = React.useMemo(() => {
    const model = {};
    for (const id of columnIds) model[id] = snapshot.columns.visible.includes(id);
    return model;
  }, [snapshot.columns.visible, columnIds]);

  const onColumnVisibilityModelChange = (model) => {
    const visible = Object.entries(model).filter(([, v]) => v).map(([k]) => k);
    setSnapshot((s) => ({ ...s, columns: { ...s.columns, visible } }));
  };

  const paginationModel = { pageSize: snapshot.pagination.pageSize, page: 0 };
  const onPaginationModelChange = (model) => setSnapshot((s) => ({ ...s, pagination: { pageSize: model.pageSize || s.pagination.pageSize } }));

  const [density, setDensity] = React.useState(snapshot.density);
  React.useEffect(() => { setSnapshot((s) => ({ ...s, density })); }, [density]);

  const [filters, setFilters] = React.useState({ ...filterSchema, ...(snapshot.filters || {}) });
  React.useEffect(() => { setSnapshot((s) => ({ ...s, filters })); }, [filters]);

  // views management
  const views = listSavedViews(key);
  const defaultViewId = getDefaultViewId(key);

  function saveCurrentAs(name) {
    return saveView(key, { name, snapshot });
  }

  function useView(id) {
    const entry = views.find((v) => v.id === id);
    if (!entry) return;
    const next = sanitizeSnapshot(mergeSnapshot(base, entry.snapshot), columnIds);
    setSnapshot(next);
    // update URL v param to reflect selection
    const vparam = serializeViewParam(next);
    const params = new URLSearchParams(location.search);
    params.set('v', vparam);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }

  function setDefaultViewId(idOrNull) {
    setDefaultView(key, idOrNull);
  }

  function toShareableUrl() {
    const vparam = serializeViewParam(snapshot);
    const params = new URLSearchParams(location.search);
    params.set('v', vparam);
    return `${location.pathname}?${params.toString()}`;
  }

  return {
    // DataGrid binders
    sortingModel,
    onSortingModelChange,
    columnVisibilityModel,
    onColumnVisibilityModelChange,
    paginationModel,
    onPaginationModelChange,
    density,
    setDensity,
    // Filters
    filters,
    setFilters,
    // Views
    views,
    saveCurrentAs,
    useView,
    defaultViewId,
    setDefaultViewId,
    toShareableUrl,
    // current snapshot if needed externally
    snapshot,
  };
}