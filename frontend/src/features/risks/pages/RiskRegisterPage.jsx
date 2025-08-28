import * as React from 'react';
import { Box, Paper, Typography, Chip, useTheme, Stack, Button, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RiskRegisterToolbar from '../components/RiskRegisterToolbar';
import RightPanelDrawer from '../../../components/rightpanel/RightPanelDrawer';
import ContextDetail from '../components/ContextDetail';
import { fetchRiskContexts } from '../../../api/services/risks';
import { adaptContextsToRegisterRows } from '../../../api/adapters/risks'; // if you don’t have it, I can supply it
import ContextBuilderDrawer from '../builder/ContextBuilderDrawer';
import { updateRiskContextOwner, bulkAssignRiskContextOwner } from '../../../api/services/risks';
import OwnerPicker from '../components/OwnerPicker';
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import { useLocation, useSearchParams } from 'react-router-dom';

const SORT_MAP = {
  residual: 'residual',
  updatedAt: 'updated_at',
  updated: 'updated_at',
  id: 'id',
  owner: 'owner',
  scope: 'scope',
  scenario: 'scenario',
};

function OwnerCell({ row, refresh }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(null); // optionally prefill from row.owner if you return ownerObj

  const commit = async (picked) => {
    setVal(picked);
    await updateRiskContextOwner(row.id, picked ? picked.id : null);
    setEditing(false);
    refresh?.(); // re-fetch current page or optimistically update row.owner
  };

  if (!editing) {
    return (
      <Chip
        size="small"
        label={val?.displayName || row.owner || 'Unassigned'}
        onClick={() => setEditing(true)}
      />
    );
  }
  return (
    <Box sx={{ minWidth: 240 }}>
      <OwnerPicker value={val} onChange={commit} autoFocus />
    </Box>
  );
}



export default function RiskRegisterPage() {
  const theme = useTheme();
  const location = useLocation();
  const [params] = useSearchParams();

  // Builder Wizard
  const [builderOpen, setBuilderOpen] = React.useState(false);

  // Saved Views wiring -------------------------------------------------------
  const scopeKey = React.useMemo(() => {
    const sc = params.get('scope') || 'global';
    const ver = params.get('versions') || 'current';
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const registerColumnsList = React.useMemo(() => ([
    { id: 'scenario', label: 'Scenario' },
    { id: 'scope', label: 'Scope' },
    { id: 'L', label: 'L' },
    { id: 'I', label: 'I' },
    { id: 'initial', label: 'Initial' },
    { id: 'residual', label: 'Residual' },
    { id: 'owner', label: 'Owner' },
    { id: 'status', label: 'Status' },
    { id: 'updated', label: 'Updated' },
  ]), []);

  const defaultViewPreset = React.useMemo(() => ({
    columns: {
      visible: registerColumnsList.map((c) => c.id),
      order: registerColumnsList.map((c) => c.id),
    },
    sort: [{ field: 'updated', sort: 'desc' }],
    pagination: { pageSize: 10 },
    density: 'compact',
    filters: { search: '', scope: 'all', status: 'all', domain: 'all', days: 90, overAppetite: false },
  }), [registerColumnsList]);

  const gridView = useGridView({
    key: 'risks/register@v1',
    defaults: defaultViewPreset,
    filterSchema: { search: '', scope: 'all', status: 'all', domain: 'all', days: 90, overAppetite: false },
    columnIds: registerColumnsList.map((c) => c.id),
    scopeKey,
  });

  // Helper to read current sort primitives
  const sortField = gridView.sortingModel?.[0]?.field || 'updated';
  const sortDir = gridView.sortingModel?.[0]?.sort === 'asc' ? 'asc' : 'desc';

  // Data
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);

  // Drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState(null);
  const [drawerTitle, setDrawerTitle] = React.useState('Risk Context');
  const [selection, setSelection] = React.useState([]);
  const [bulkOwner, setBulkOwner] = React.useState(null);
  const [bulkBusy, setBulkBusy] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, severity: 'success', message: '' });

  const reloadCurrentPage = React.useCallback(() => {
    // trigger refetch by bumping a local tick
    setRefreshTick((t) => t + 1);
  }, []);

  // Note: do not sync currentPage from gridView here; it can race and reset to 0.
  // currentPage is the single source of truth for pagination in this view.
  // Fetch contexts (server-side paging/sorting)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const sort_by  = SORT_MAP[sortField] || 'updated_at';
        const sort_dir = sortDir;

        const limit = Number(gridView.paginationModel.pageSize) || 10;
        const page = Number.isFinite(currentPage) ? currentPage : Number(gridView.paginationModel.page || 0);
        const params = {
          offset: page * limit,
          limit,
          sort: sort_by,
          sort_dir,
          scope: gridView.filters.scope,
          status: gridView.filters.status,
          domain: gridView.filters.domain,
          days: gridView.filters.days,
        };
        if (gridView.filters.search) params.search = gridView.filters.search;
        if (gridView.filters.overAppetite) params.over_appetite = true;

        const res = await fetchRiskContexts(params);
        if (!alive) return;
        setTotal(res?.total ?? 0);
        setRows(adaptContextsToRegisterRows(res?.items || []));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [
    gridView.filters.search,
    gridView.filters.scope,
    gridView.filters.status,
    gridView.filters.domain,
    gridView.filters.days,
    gridView.filters.overAppetite,
    gridView.paginationModel.pageSize,
    sortField,
    sortDir,
    refreshTick,
    currentPage,
  ]);

  // Columns (compact, professional)
  const rawColumns = React.useMemo(() => ([
    { field: 'scenario', headerName: 'Scenario', flex: 1.4, minWidth: 240 },
    { field: 'scope',    headerName: 'Scope',    flex: 1.0, minWidth: 160 },
    { field: 'L',        headerName: 'L', width: 60, align:'center', headerAlign:'center' },
    { field: 'I',        headerName: 'I', width: 60, align:'center', headerAlign:'center' },
    { field: 'initial',  headerName: 'Initial', width: 90, align:'center', headerAlign:'center' },
    {
      field: 'residual', headerName: 'Residual', width: 100, align:'center', headerAlign:'center',
      renderCell:(p)=>(
        <Chip size="small" label={p.value} color={p.row.ragMui || 'default'} />
      ),
      sortable: true,
    },
    {
    field: 'owner',
    headerName: 'Owner',
    width: 200,
    sortable: false,
    renderCell: (p) => <OwnerCell row={p.row} refresh={reloadCurrentPage} />,
  },
    { field: 'status',   headerName: 'Status', width: 140,
      renderCell: (p) => (
        <Chip size="small" label={p.row.statusLabel || '—'} color={p.row.statusColor || 'default'} variant={p.row.statusVariant || 'outlined'} />
      )
    },
    { field: 'updated',  headerName: 'Updated', width: 160, sortable: true },
  ]), [theme, reloadCurrentPage]);

  const columns = React.useMemo(
    () => gridView.orderColumns(rawColumns),
    [rawColumns, gridView.snapshot.columns.order]
  );

  // Guard against saved views with a sort field not present in current columns
  const availableFields = React.useMemo(() => new Set(rawColumns.map((c) => c.field)), [rawColumns]);
  const effectiveSortingModel = React.useMemo(() => {
    const sm = Array.isArray(gridView.sortingModel) ? gridView.sortingModel : [];
    const first = sm[0];
    if (!first) return sm;
    if (availableFields.has(first.field)) return sm;
    if (first.field === 'updatedAt') return [{ field: 'updated', sort: first.sort || 'desc' }];
    return [];
  }, [gridView.sortingModel, availableFields]);

  // CSV Export (visible columns, current page rows)
  const handleExportCSV = React.useCallback(() => {
    const order = (gridView?.snapshot?.columns?.order || []).filter(Boolean);
    const visibility = gridView.columnVisibilityModel || {};
    const colById = new Map(columns.map((c) => [c.field, c]));
    const selectedFields = (order.length ? order : columns.map((c) => c.field))
      .filter((id) => visibility[id] !== false && colById.has(id));

    const header = selectedFields.map((id) => colById.get(id)?.headerName || id);
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };
    const body = rows.map((r) => selectedFields.map((id) => esc(r[id])).join(','));
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'risk-register.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }, [columns, gridView?.snapshot?.columns?.order, gridView.columnVisibilityModel, rows]);

  return (
    <Box sx={{ p: 2, display:'grid', gap: 1.5 }}>
      <Typography variant="h6">Risk Register</Typography>

      <SavedViewBar
        title="Saved Views"
        gridView={gridView}
        columnsList={registerColumnsList}
        presets={[]}
      />

      {(() => {
        const prev = gridView.filters;
        const handleFiltersChange = (next) => {
          const same = (a, b) => {
            const keys = ['search','scope','status','domain','days','overAppetite'];
            for (const k of keys) if ((a?.[k] ?? null) !== (b?.[k] ?? null)) return false;
            return true;
          };
          if (!same(prev, next)) {
            gridView.setFilters(next);
            gridView.onPaginationModelChange({ ...gridView.paginationModel, page: 0 });
            setCurrentPage(0);
          }
        };
        return (
          <RiskRegisterToolbar
            filters={gridView.filters}
            onFiltersChange={handleFiltersChange}
            onCreateRisk={()=> setBuilderOpen(true)}
          />
        );
      })()}

      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button size="small" variant="outlined" onClick={handleExportCSV}>Export CSV</Button>
      </Stack>

      {selection.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1, borderRadius: 1.5, mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Selected: {selection.length}
            </Typography>
            <OwnerPicker value={bulkOwner} onChange={(v)=> setBulkOwner(v)} placeholder="Assign owner…" />
            <Button
              size="small"
              variant="contained"
              disabled={!bulkOwner || bulkBusy}
              onClick={async () => {
                setBulkBusy(true);
                try {
                  const { updated, failed } = await bulkAssignRiskContextOwner(selection, bulkOwner?.id ?? null);
                  setToast({ open: true, severity: failed ? 'warning' : 'success', message: `{updated:${updated}, failed:${failed}}` });
                  setSelection([]);
                  setBulkOwner(null);
                  reloadCurrentPage();
                } catch (e) {
                  setToast({ open: true, severity: 'error', message: 'Bulk update failed' });
                } finally {
                  setBulkBusy(false);
                }
              }}
            >
              {bulkBusy ? 'Assigning…' : 'Assign to selected'}
            </Button>
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            getRowId={(r) => r.id}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={total}
            paginationModel={{ page: currentPage, pageSize: gridView.paginationModel.pageSize }}
            onPaginationModelChange={(model)=> {
              const nextPage = typeof model?.page === 'number' ? model.page : currentPage;
              const nextSize = typeof model?.pageSize === 'number' ? model.pageSize : gridView.paginationModel.pageSize;
              setCurrentPage(nextPage);
              gridView.onPaginationModelChange({ page: nextPage, pageSize: nextSize });
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            sortingMode="server"
            sortModel={effectiveSortingModel}
            onSortModelChange={gridView.onSortingModelChange}
            columnVisibilityModel={gridView.columnVisibilityModel}
            onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
            density={gridView.density}
            checkboxSelection
            onRowSelectionModelChange={(model, details)=> {
              // Normalize selection strictly to an array of row IDs across MUI versions
              if (Array.isArray(model)) {
                try { console.log('[RiskRegister] selection change (array)', model); } catch {}
                setSelection(model);
                return;
              }
              if (model && typeof model.size === 'number') {
                const next = Array.from(model);
                try { console.log('[RiskRegister] selection change (Set)', next); } catch {}
                setSelection(next);
                return;
              }
              // Newer builds: derive from grid api
              let next = [];
              try {
                const api = details && details.api;
                const map = api && api.getSelectedRows ? api.getSelectedRows() : null;
                if (map && typeof map.size === 'number') next = Array.from(map.keys());
              } catch {}
              try { console.log('[RiskRegister] selection change (api.getSelectedRows)', next, details); } catch {}
              setSelection(next);
            }}
            onSelectionModelChange={(legacy)=> {
              // Legacy handler for older MUI variants; normalize to array
              let next = [];
              if (Array.isArray(legacy)) next = legacy;
              else if (legacy && typeof legacy.size === 'number') next = Array.from(legacy);
              try { console.log('[RiskRegister] selection change (legacy)', next); } catch {}
              setSelection(next);
            }}
            onRowClick={(p) => { setActiveRow(p.row); }}
            onRowDoubleClick={(p) => { setActiveRow(p.row); setDrawerOpen(true); setDrawerTitle(p.row.scenario || 'Risk Context'); }}
          />
        </Box>
      </Paper>

      <RightPanelDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        initialWidth={600}
        minWidth={420}
        maxWidth={1100}
      >
        {activeRow ? (
          <ContextDetail
            contextId={activeRow.id}
            onLoadedTitle={(t) => setDrawerTitle(t || 'Risk Context')}
          />
        ) : null}
      </RightPanelDrawer>

      <ContextBuilderDrawer
        open={builderOpen}
        onClose={()=> setBuilderOpen(false)}
        onCreated={(summary)=> {
          // TODO: refresh metrics  contexts
          console.log('Created:', summary);
          setBuilderOpen(false);
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
