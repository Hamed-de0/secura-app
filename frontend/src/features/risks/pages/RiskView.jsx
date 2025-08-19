import React, { useContext, useMemo, useState } from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useRisksAtScope, useRiskAppetite } from "../hooks";
import RiskFilters from "../components/RiskFilters.jsx";
import RiskTable from "../components/RiskTable.jsx";
import RiskDetailDrawer from "../components/RiskDetailDrawer.jsx";
import RiskMetrics from "../components/RiskMetrics.jsx";
import RiskHeatmapPanel from "../components/RiskHeatmapPanel.jsx";
import RiskAppetiteStrip from "../components/RiskAppetiteStrip.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import SearchOffIcon from "@mui/icons-material/SearchOff";

// NEW
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import { buildColumns, defaultViewPreset, columnsList, presets } from '../../risks/columns.jsx';

export default function RiskView() {
  const { scope } = useContext(ScopeContext);
  const { data: risks, isLoading, isError, error } = useRisksAtScope(scope);
  const [selected, setSelected] = useState(null);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState(null);
  const [level, setLevel] = useState(null);

  const gridView = useGridView({
    key: 'risks/list@v1',
    defaults: defaultViewPreset,
    filterSchema: { q: '', status: null, level: null },
    columnIds: columnsList.map(c => c.id),
  });

  React.useEffect(() => { gridView.setFilters({ q, status, level }); }, [q, status, level]);

  const rows = useMemo(() => {
    const items = risks || [];
    const _q = (q || '').toLowerCase();
    return items.filter(r => {
      if (_q && !(`${r.title ?? ''} ${r.owner ?? ''}`.toLowerCase().includes(_q))) return false;
      if (status && (r.status ?? '') !== status) return false;
      if (level && (Number(r.residual_level) !== Number(level))) return false;
      return true;
    });
  }, [risks, q, status, level]);

  if (isLoading) return <Skeleton variant="rounded" height={360} />;
  if (isError) return <ErrorState icon={SearchOffIcon} title="Failed to load" description={error?.message || 'Error'} />;
  if (!risks || risks.length === 0) return <EmptyState title="No risks" description="Nothing to show at this scope." />;

  // const columns = React.useMemo(() => buildColumns(), []);
  const rawColumns = React.useMemo(() => buildColumns(), []);
  const columns = React.useMemo(() => gridView.orderColumns(rawColumns), [rawColumns, gridView.snapshot.columns.order]);
  
  return (
    <Box>
      <SavedViewBar title="Risks" gridView={gridView} columnsList={columnsList} presets={presets} />
      <RiskAppetiteStrip />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <RiskFilters q={q} setQ={setQ} status={status} setStatus={setStatus} level={level} setLevel={setLevel} />
          <RiskTable
            rows={rows}
            loading={false}
            onRowClick={(row) => setSelected(row)}
            columns={columns}
            columnVisibilityModel={gridView.columnVisibilityModel}
            onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
            sortingModel={gridView.sortingModel}
            onSortingModelChange={gridView.onSortingModelChange}
            paginationModel={gridView.paginationModel}
            onPaginationModelChange={gridView.onPaginationModelChange}
            density={gridView.density}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <RiskMetrics />
          <RiskHeatmapPanel />
        </Grid>
      </Grid>

      <RiskDetailDrawer open={!!selected} onClose={() => setSelected(null)} risk={selected} />
    </Box>
  );
}