import * as React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Box, Grid, Skeleton } from '@mui/material';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import ErrorState from '../../../components/ui/ErrorState.jsx';
import TaskTable from '../components/TaskTable.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskDrawer from '../components/TaskDrawer.jsx';
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import { buildColumns, columnsList, defaultViewPreset } from '../columns.jsx';
import { sampleTasks } from '../mocks.js';
import { useTheme } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function MyWork() {
  const theme = useTheme();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  // scope key for per-scope saved views (reuses your convention)
  const scopeKey = React.useMemo(() => {
    const sc = params.get('scope') || 'global';
    const ver = params.get('versions') || 'current';
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  // Grid view state/persistence
  const gridView = useGridView({
    key: 'mywork/tasks@v1',
    defaults: defaultViewPreset,
    filterSchema: { q: '', type: null, status: null },
    columnIds: columnsList.map(c => c.id),
    syncQueryParamQ: true,
    scopeKey,
  });

  // Local filters (synced into gridView for snapshots)
  const q = params.get('q') ?? '';
  const [type, setType] = React.useState(null);
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    gridView.setFilters({ q, type, status });
  }, [q, type, status]); // eslint-disable-line

  // Build columns before any early return (stable hooks)
  const rawColumns = React.useMemo(() => buildColumns(theme), [theme]);
  const columns = React.useMemo(
    () => gridView.orderColumns(rawColumns),
    [rawColumns, gridView.snapshot.columns.order]
  );

  // --- NEW: make scope/version filters tolerant to unknown values ---
  const allScopes = React.useMemo(() => new Set(sampleTasks.map(t => t.scope)), []);
  const allVersions = React.useMemo(() => new Set(sampleTasks.map(t => t.versions)), []);
  const scopeParam = params.get('scope');
  const versionsParam = params.get('versions');
  const effectiveScope = scopeParam && allScopes.has(scopeParam) ? scopeParam : null;
  const effectiveVersions = versionsParam && allVersions.has(versionsParam) ? versionsParam : null;

  const rows = React.useMemo(() => {
    const _q = (q || '').toLowerCase();
    return sampleTasks.filter(t => {
      if (effectiveScope && t.scope !== effectiveScope) return false;
      if (effectiveVersions && t.versions !== effectiveVersions) return false;
      if (type && t.type !== type) return false;
      if (status && t.status !== status) return false;
      if (_q) {
        const hay = `${t.title} ${t.objectType} ${t.objectCode} ${t.assignee}`.toLowerCase();
        if (!hay.includes(_q)) return false;
      }
      return true;
    });
  }, [q, type, status, effectiveScope, effectiveVersions]);

  // Mock “loading” shape (keeps standards; instantly loads)
  const isLoading = false;
  const isError = false;
  const error = null;

  

  const [selected, setSelected] = React.useState(null);

  if (isLoading) return <Skeleton variant="rounded" height={360} />;
  if (isError) return <ErrorState icon={AssignmentIcon} title="Failed to load" description={error?.message || 'Error'} />;
  if (!rows || rows.length === 0) return <EmptyState title="No tasks" description="Nothing to show here yet." />;

  return (
    <Box sx={{ mb: 1 }}>
      <SavedViewBar
        title="My Work"
        gridView={gridView}
        columnsList={columnsList}
        presets={[]}
      />

      <TaskFilters
        q={q}
        setQ={(val) => { params.set('q', val); setParams(params, { replace: true }); }}
        type={type} setType={setType}
        status={status} setStatus={setStatus}
        total={rows.length}
      />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TaskTable
            rows={rows}
            loading={false}
            columns={columns}
            onRowClick={(row) => setSelected(row)}
            columnVisibilityModel={gridView.columnVisibilityModel}
            onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
            sortingModel={gridView.sortingModel}
            onSortingModelChange={gridView.onSortingModelChange}
            paginationModel={gridView.paginationModel}
            onPaginationModelChange={gridView.onPaginationModelChange}
            density={gridView.density}
          />
        </Grid>
      </Grid>

      <TaskDrawer open={!!selected} onClose={() => setSelected(null)} task={selected} />
    </Box>
  );
}
