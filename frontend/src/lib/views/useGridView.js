import * as React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  makeDefaultSnapshot,
  mergeSnapshot,
  sanitizeSnapshot,
} from "./gridState";
import { parseViewParam, serializeViewParam } from "./urlParam";
import {
  listSavedViews,
  saveView,
  getDefaultView,
  setDefaultView,
  getDefaultViewId,
} from "./storage";
import { updateView as _updateView, deleteViewById } from "./storage";
import rafThrottle from "../utils/rafThrottle";

/**
 * useGridView — single source of truth for persisted/sharable grid & filter state
 *
 * @param {Object} opts
 *  - key: stable route key (e.g., 'controls/effective@v1')
 *  - defaults: snapshot default (from feature preset)
 *  - filterSchema: object of default filter values (e.g., { q: '', status: null })
 *  - columnIds: array of allowed column ids for sanitization
 *  - syncQueryParamQ?: if true, mirror filters.q <-> URL ?q= for backward compat
 *  - scopeKey?: optional per-scope storage suffix
 */
export default function useGridView({
  key,
  defaults,
  filterSchema = {},
  columnIds = [],
  syncQueryParamQ = false,
  scopeKey = "",
}) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Effective storage key (per page - optional scope)
  const storageKey = React.useMemo(
    () => (scopeKey ? `${key}::${scopeKey}` : key),
    [key, scopeKey]
  );

  // 1) establish base snapshot from defaults
  const base = React.useMemo(
    () =>
      makeDefaultSnapshot({
        columns: defaults?.columns || { visible: [], order: [] },
        sort: defaults?.sort || [],
        pagination: defaults?.pagination || { pageSize: 10 },
        density: defaults?.density || "standard",
        filters: { ...(defaults?.filters || {}), ...filterSchema },
      }),
    [defaults, filterSchema]
  );

  // 2) try URL v= param
  const urlSnapshot = React.useMemo(
    () =>
      sanitizeSnapshot(
        mergeSnapshot(base, parseViewParam(searchParams.get("v")) || null),
        columnIds
      ),
    [base, columnIds, searchParams]
  );

  // 3) fallback to default saved view
  const defaultSaved = React.useMemo(() => {
    const snap = getDefaultView(storageKey);
    return sanitizeSnapshot(mergeSnapshot(base, snap || null), columnIds);
  }, [base, storageKey, columnIds]);

  const initial = searchParams.get("v") ? urlSnapshot : defaultSaved;
  const [snapshot, setSnapshot] = React.useState(initial);

  // sync ?q= legacy param with filters.q if requested (read-once)
  React.useEffect(() => {
    if (!syncQueryParamQ) return;
    const q = searchParams.get("q") ?? "";
    setSnapshot((s) => ({ ...s, filters: { ...s.filters, q } }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Throttled URL updater (keeps existing params like scope/versions) ---
  const updateUrlV = React.useMemo(
    () =>
      rafThrottle((vparam, qValue) => {
        const params = new URLSearchParams(location.search);
        params.set("v", vparam);
        if (syncQueryParamQ) {
          if (typeof qValue === "string" && qValue.length > 0)
            params.set("q", qValue);
          else params.delete("q");
        }
        navigate(`${location.pathname}?${params.toString()}`, {
          replace: true,
        });
      }),
    [navigate, location.pathname, location.search, syncQueryParamQ]
  );

  // --- DataGrid controlled models & handlers (stable) ---
  const sortingModel = snapshot.sort;
  const onSortingModelChange = React.useCallback(
    (model) => {
      setSnapshot((s) =>
        sanitizeSnapshot({ ...s, sort: Array.isArray(model) ? model : [] }, columnIds)
      );
    },
    [columnIds]
  );

  const columnVisibilityModel = React.useMemo(() => {
    const model = {};
    for (const id of columnIds)
      model[id] = snapshot.columns.visible.includes(id);
    return model;
  }, [snapshot.columns.visible, columnIds]);

  const onColumnVisibilityModelChange = React.useCallback(
    (model) => {
      const visible = Object.entries(model)
        .filter(([, v]) => !!v)
        .map(([k]) => k);
      setSnapshot((s) =>
        sanitizeSnapshot(
          { ...s, columns: { ...s.columns, visible } },
          columnIds
        )
      );
    },
    [columnIds]
  );

  // Keep page in local state to ensure pagination arrows work even if sanitize drops page
  const [pageState, setPageState] = React.useState(() => (
    typeof snapshot.pagination?.page === 'number' ? snapshot.pagination.page : 0
  ));
  React.useEffect(() => {
    const p = typeof snapshot.pagination.page === 'number' ? snapshot.pagination.page : 0;
    if (p !== pageState) setPageState(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.pagination.page]);

  const paginationModel = {
    pageSize: snapshot.pagination.pageSize,
    page: pageState,
  };
  const onPaginationModelChange = React.useCallback(
    (model) => {
      const nextPage = typeof model?.page === 'number'
        ? model.page
        : (typeof snapshot.pagination.page === 'number' ? snapshot.pagination.page : 0);
      const nextSize = typeof model?.pageSize === 'number'
        ? model.pageSize
        : snapshot.pagination.pageSize;
      setPageState(nextPage);
      setSnapshot((s) =>
        sanitizeSnapshot(
          {
            ...s,
            pagination: {
              pageSize: nextSize,
              page: nextPage,
            },
          },
          columnIds
        )
      );
    },
    [columnIds, snapshot.pagination.pageSize]
  );

  const [density, setDensity] = React.useState(snapshot.density);
  React.useEffect(() => {
    setSnapshot((s) => ({ ...s, density }));
  }, [density]);

  const [filters, setFilters] = React.useState({
    ...filterSchema,
    ...(snapshot.filters || {}),
  });
  React.useEffect(() => {
    setSnapshot((s) => ({ ...s, filters }));
  }, [filters]);

  // views management
  const views = listSavedViews(storageKey);
  const defaultViewId = getDefaultViewId(storageKey);

  const saveCurrentAs = React.useCallback(
    function saveCurrentAs(name) {
      return saveView(storageKey, { name, snapshot });
    },
    [storageKey, snapshot]
  );

  const useView = React.useCallback(
    function useView(id) {
      const entry = views.find((v) => v.id === id);
      if (!entry) return;
      const next = sanitizeSnapshot(
        mergeSnapshot(base, entry.snapshot),
        columnIds
      );
      setSnapshot(next);
      updateUrlV(serializeViewParam(next), next.filters?.q ?? "");
    },
    [views, base, columnIds, updateUrlV]
  );

  function setDefaultViewIdFn(idOrNull) {
    setDefaultView(storageKey, idOrNull);
  }

  function toShareableUrl() {
    const vparam = serializeViewParam(snapshot);
    const params = new URLSearchParams(location.search);
    params.set("v", vparam);
    return `${location.pathname}?${params.toString()}`;
  }

  function toShareParam() {
    return serializeViewParam(snapshot);
  }

  function applySnapshot(nextSnapshot) {
    const next = sanitizeSnapshot(
      mergeSnapshot(base, nextSnapshot || {}),
      columnIds
    );
    setSnapshot(next);
    updateUrlV(serializeViewParam(next), next.filters?.q ?? "");
  }

  function resetFilters() {
    const next = { ...snapshot, filters: { ...filterSchema } };
    applySnapshot(next);
  }

  return {
    // View
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
    setDefaultViewId: setDefaultViewIdFn,
    toShareableUrl,
    resetFilters,
    toShareParam,
    applySnapshot,
    deleteView: (id) => deleteViewById(storageKey, id),
    renameView: (id, name) => _updateView(storageKey, id, { name }),
    // Column order state
    setColumnOrder: (orderIds) =>
      setSnapshot((s) =>
        sanitizeSnapshot(
          { ...s, columns: { ...s.columns, order: orderIds } },
          columnIds
        )
      ),
    orderColumns: (cols) => {
      const order = snapshot.columns?.order || [];
      const byId = new Map(cols.map((c) => [c.field, c]));
      const seen = new Set();
      const ordered = [];
      // first, use explicit order
      for (const id of order) {
        const c = byId.get(id);
        if (c) {
          ordered.push(c);
          seen.add(id);
        }
      }
      // then append any columns not in order yet (stable)
      for (const c of cols) if (!seen.has(c.field)) ordered.push(c);
      return ordered;
    },
    // current snapshot if needed externally
    snapshot,
  };
}
