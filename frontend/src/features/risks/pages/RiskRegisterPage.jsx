import * as React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import  RightPanelDrawer  from '../../../components/rightpanel/RightPanelDrawer';
import { fetchRiskContexts } from '../../../api/services/risks'; // you already added this earlier
import ContextDetail from '../components/ContextDetail';

export default function RiskRegisterPage() {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [model, setModel] = React.useState({ page: 0, pageSize: 10 });

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState(null);
  const [drawerTitle, setDrawerTitle] = React.useState('Risk Context');

  const columns = React.useMemo(() => ([
    { field: 'scenarioTitle', headerName: 'Scenario', flex: 1.4, minWidth: 240 },
    { field: 'scopeDisplay',  headerName: 'Scope',    flex: 0.8, minWidth: 160,
      valueGetter: p => p.row?.scopeName || p.row?.scopeRef?.label || p.row?.scope || '' },
    { field: 'likelihood',    headerName: 'L', width: 60, align:'center', headerAlign:'center' },
    { field: 'impacts',       headerName: 'I', width: 60, align:'center', headerAlign:'center',
      valueGetter: p => Math.max(0, ...(Object.values(p.row?.impacts || {}))) },
    { field: 'initial',       headerName: 'Initial', width: 90, align:'center', headerAlign:'center' },
    { field: 'residual',      headerName: 'Residual', width: 100, align:'center', headerAlign:'center',
      renderCell:(p)=>(<Chip size="small" label={p.value} />) },
    { field: 'owner',         headerName: 'Owner', width: 140 },
    { field: 'status',        headerName: 'Status', width: 120 },
    { field: 'updatedAt',     headerName: 'Updated', width: 160,
      valueGetter: p => p.row?.updatedAt ? new Date(p.row?.updatedAt).toLocaleString() : '—' },
  ]), []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchRiskContexts({
          offset: model.page * model.pageSize,
          limit: model.pageSize,
          sort_by: 'updated_at',
          sort_dir: 'desc',
          scope: 'all',
          status: 'all',
          domain: 'all',
          days: 90,
        });
        if (!alive) return;
        setTotal(res?.total ?? 0);
        setRows(res?.items || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [model.page, model.pageSize]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Risk Register</Typography>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            getRowId={(r) => r.contextId}
            columns={columns}
            loading={loading}
            rowCount={total}
            paginationMode="server"
            paginationModel={model}
            onPaginationModelChange={setModel}
            disableColumnMenu
            density="compact"
            onRowClick={(p) => { setActiveRow(p.row); setDrawerOpen(true); }}
          />
        </Box>
      </Paper>

      <RightPanelDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        initialWidth={560}
        minWidth={420}
        maxWidth={1000}
      >
        {activeRow ? (
          <ContextDetail
            contextId={activeRow.contextId}
            onLoadedTitle={(t) => setDrawerTitle(t || 'Risk Context')}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select a row from the table to view details.
          </Typography>
        )}
      </RightPanelDrawer>
    </Box>
  );
}
