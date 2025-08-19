import * as React from 'react';
import { Box, Stack, TextField, MenuItem } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';
import { columnsList, defaultViewPreset, buildColumns } from '../columns.jsx';
import { sampleVendors } from '../mocks.js';
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import GridTable from '../../../components/GridTable.jsx';

export default function Providers() {
  const [params] = useSearchParams();
  const location = useLocation();
  const scopeKey = React.useMemo(()=> {
    const sc = params.get('scope') || 'global'; const ver = params.get('versions') || 'current';
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const gridView = useGridView({
    key: 'providers/list@v1',
    defaults: defaultViewPreset,
    filterSchema: { q: '', tier: null, status: null },
    columnIds: columnsList.map(c=>c.id),
    syncQueryParamQ: true,
    scopeKey,
  });

  const [tier, setTier] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const q = params.get('q') ?? '';
  React.useEffect(()=> gridView.setFilters({ q, tier, status }), [q, tier, status]); // eslint-disable-line

  const rows = React.useMemo(()=>{
    const _q = q.toLowerCase();
    return sampleVendors.filter(v=>{
      if (tier && v.tier !== tier) return false;
      if (status && v.status !== status) return false;
      if (_q && !(v.name.toLowerCase().includes(_q))) return false;
      return true;
    });
  }, [q, tier, status]);

  const columns = React.useMemo(()=> gridView.orderColumns(buildColumns()), [gridView.snapshot.columns.order]);

  return (
    <Box>
      <SavedViewBar title="Providers" gridView={gridView} columnsList={columnsList} presets={[]} />
      <Stack direction="row" spacing={2} sx={{ my: 1 }} alignItems="center">
        <TextField size="small" label="Search" value={q} onChange={(e)=> {
          const u = new URLSearchParams(params); u.set('q', e.target.value); history.replaceState(null, '', `${location.pathname}?${u.toString()}`);
        }} />
        <TextField size="small" select label="Tier" value={tier ?? ''} onChange={(e)=> setTier(e.target.value || null)} sx={{ minWidth: 180 }}>
          <MenuItem value="">(Any)</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </TextField>
        <TextField size="small" select label="Status" value={status ?? ''} onChange={(e)=> setStatus(e.target.value || null)} sx={{ minWidth: 180 }}>
          <MenuItem value="">(Any)</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Stack>
      <GridTable
        rows={rows}
        columns={columns}
        columnVisibilityModel={gridView.columnVisibilityModel}
        onColumnVisibilityModelChange={gridView.onColumnVisibilityModelChange}
        sortingModel={gridView.sortingModel}
        onSortingModelChange={gridView.onSortingModelChange}
        paginationModel={gridView.paginationModel}
        onPaginationModelChange={gridView.onPaginationModelChange}
        density={gridView.density}
      />
    </Box>
  );
}
