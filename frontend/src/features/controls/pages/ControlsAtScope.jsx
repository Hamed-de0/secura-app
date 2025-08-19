import React, { useContext, useMemo, useState } from "react";
import { Box, Grid, Skeleton } from "@mui/material";
import { ScopeContext } from "../../../store/scope/ScopeProvider.jsx";
import { useEffectiveControls } from "../hooks";
import ControlsFilters from "../components/ControlsFilters.jsx";
import EffectiveControlsGrid from "../components/EffectiveControlsGrid.jsx";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ErrorState from "../../../components/ui/ErrorState.jsx";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ControlImpactDrawer from '../components/ControlImpactDrawer.jsx';
import { useAssuranceOverlay } from '../../evidence/hooks';

// NEW
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import { buildColumns, defaultViewPreset, columnsList, presets } from '../../controls/columns.jsx';
import { useTheme } from '@mui/material/styles';

export default function ControlsAtScope() {
  const theme = useTheme();
  const { scope } = useContext(ScopeContext);
  const { data: controls, isLoading, isError, error } = useEffectiveControls(scope);
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);

  const q = params.get('q') ?? '';
  const [source, setSource] = useState(null);
  const [assurance, setAssurance] = useState(null);

  // grid view state (persist/share) — mirror ?q= for compatibility
  const gridView = useGridView({
    key: 'controls/effective@v1',
    defaults: defaultViewPreset,
    filterSchema: { q: '', source: null, assurance: null },
    columnIds: columnsList.map(c => c.id),
    syncQueryParamQ: true,
  });

  // derive rows
  const items = controls || [];
  const filtered = useMemo(() => {
    const _q = (q || '').toLowerCase();
    const list = items.filter(r => {
      if (source && r.source !== source) return false;
      if (assurance && (r.assurance_status ?? '').toLowerCase() !== assurance) return false;
      if (_q) {
        const hay = `${r.code ?? ''} ${r.title ?? ''}`.toLowerCase();
        if (!hay.includes(_q)) return false;
      }
      return true;
    });
    return list;
  }, [items, source, assurance, q]);

  // keep gridView.filters in sync with local filters (so snapshots include them)
  React.useEffect(() => { gridView.setFilters({ q, source, assurance }); }, [q, source, assurance]);

  if (isLoading) return <Skeleton variant="rounded" height={360} />;
  if (isError) return <ErrorState icon={FilterAltIcon} title="Failed to load" description={error?.message || 'Error'} />;
  if (!items || items.length === 0) return <EmptyState title="No controls" description="Nothing to show at this scope." />;

  // build registry columns once
  const rawColumns = React.useMemo(() => buildColumns(theme), [theme]);
  const columns = React.useMemo(() => gridView.orderColumns(rawColumns), [rawColumns, gridView.snapshot.columns.order]);

  
  return (
    <>
      <Box sx={{ mb: 1 }}>
        <SavedViewBar title="Controls" gridView={gridView} columnsList={columnsList} presets={presets} />
        <ControlsFilters
          source={source} setSource={setSource}
          assurance={assurance} setAssurance={setAssurance}
          q={q} setQ={(val)=> { params.set('q', val); setParams(params, { replace: true }); }}
          total={filtered.length}
        />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <EffectiveControlsGrid
              rows={filtered}
              loading={false}
              onRowClick={(row) => setSelected(row)}
              // controlled state
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
        </Grid>
      </Box>
      <ControlImpactDrawer open={!!selected} onClose={() => setSelected(null)} control={selected} />
    </>
  );
}