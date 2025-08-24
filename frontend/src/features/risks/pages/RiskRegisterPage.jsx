import * as React from 'react';
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RiskRegisterToolbar from '../components/RiskRegisterToolbar';
import RightPanelDrawer from '../../../components/rightpanel/RightPanelDrawer';
import ContextDetail from '../components/ContextDetail';
import { fetchRiskContexts } from '../../../api/services/risks';
import { adaptContextsToRegisterRows } from '../../../api/adapters/risks'; // if you don’t have it, I can supply it
import ContextBuilderDrawer from '../builder/ContextBuilderDrawer';


const SORT_MAP = {
  residual: 'residual',
  updatedAt: 'updated_at',
  id: 'id',
};

export default function RiskRegisterPage() {
  const theme = useTheme();

  // Builder Wizard
  const [builderOpen, setBuilderOpen] = React.useState(false);

  // Filters shared with backend (defaults match your API)
  const [filters, setFilters] = React.useState({
    search: '',
    scope: 'all',
    status: 'all',
    domain: 'all',
    days: 90,
    overAppetite: false, // pass only when true
  });

  // Grid state
  const [model, setModel] = React.useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = React.useState([{ field: 'updatedAt', sort: 'desc' }]);

  // Data
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState(null);
  const [drawerTitle, setDrawerTitle] = React.useState('Risk Context');

  // Fetch contexts (server-side paging/sorting)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const sort_by  = SORT_MAP[sortModel[0]?.field] || 'updated_at';
        const sort_dir = sortModel[0]?.sort === 'asc' ? 'asc' : 'desc';

        const params = {
          offset: model.page * model.pageSize,
          limit: model.pageSize,
          sort_by,
          sort_dir,
          scope: filters.scope,
          status: filters.status,
          domain: filters.domain,
          days: filters.days,
        };
        if (filters.search) params.search = filters.search;
        if (filters.overAppetite) params.over_appetite = true;

        const res = await fetchRiskContexts(params);
        if (!alive) return;
        setTotal(res?.total ?? 0);
        setRows(adaptContextsToRegisterRows(res?.items || []));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [filters, model.page, model.pageSize, sortModel]);

  // Columns (compact, professional)
  const columns = React.useMemo(() => ([
    { field: 'scenario', headerName: 'Scenario', flex: 1.4, minWidth: 240 },
    { field: 'scope',    headerName: 'Scope',    flex: 1.0, minWidth: 160 },
    { field: 'L',        headerName: 'L', width: 60, align:'center', headerAlign:'center' },
    { field: 'I',        headerName: 'I', width: 60, align:'center', headerAlign:'center' },
    { field: 'initial',  headerName: 'Initial', width: 90, align:'center', headerAlign:'center' },
    {
      field: 'residual', headerName: 'Residual', width: 100, align:'center', headerAlign:'center',
      renderCell:(p)=>(
        <Chip size="small" label={p.value}
              sx={{ color: theme.palette.getContrastText(theme.palette.primary.light),
                    bgcolor: theme.palette.primary.light }} />
      ),
      sortable: true,
    },
    { field: 'owner',    headerName: 'Owner', width: 140 },
    { field: 'status',   headerName: 'Status', width: 120 },
    { field: 'updated',  headerName: 'Updated', width: 160, sortable: true },
  ]), [theme]);

  return (
    <Box sx={{ p: 2, display:'grid', gap: 1.5 }}>
      <Typography variant="h6">Risk Register</Typography>

      <RiskRegisterToolbar
        filters={filters}
        onFiltersChange={(f)=>{ setModel(m=>({ ...m, page: 0 })); setFilters(f); }}
        onCreateRisk={()=> setBuilderOpen(true)}
      />

      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            getRowId={(r) => r.id}
            columns={columns}
            loading={loading}
            paginationMode="server"
            rowCount={total}
            paginationModel={model}
            onPaginationModelChange={setModel}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={(sm)=> setSortModel(sm.length ? sm : [{ field:'updatedAt', sort:'desc' }])}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => { setActiveRow(p.row); setDrawerOpen(true); setDrawerTitle(p.row.scenario || 'Risk Context'); }}
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
    </Box>
  );
}
