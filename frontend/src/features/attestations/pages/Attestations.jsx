import * as React from 'react';
import { Box, Stack, TextField, MenuItem } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';
import { columnsList, defaultViewPreset, buildColumns } from '../columns.jsx';
import { sampleCampaigns } from '../mocks.js';
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import GridTable from '../../../components/GridTable.jsx';
import CampaignDrawer from '../components/CampaignDrawer.jsx';

export default function Attestations() {
  const [params] = useSearchParams();
  const location = useLocation();
  const scopeKey = React.useMemo(() => {
    const sc = params.get('scope') || 'global';
    const ver = params.get('versions') || 'current';
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const gridView = useGridView({
    key: 'attestations/campaigns@v1',
    defaults: defaultViewPreset,
    filterSchema: { q: '', status: null },
    columnIds: columnsList.map(c=>c.id),
    syncQueryParamQ: true,
    scopeKey,
  });

  const [status, setStatus] = React.useState(null);
  const q = params.get('q') ?? '';
  React.useEffect(()=> gridView.setFilters({ q, status }), [q, status]); // eslint-disable-line

  const allScopes = React.useMemo(()=> new Set(sampleCampaigns.map(t=>t.scope)), []);
  const allVersions = React.useMemo(()=> new Set(sampleCampaigns.map(t=>t.versions)), []);
  const sParam = params.get('scope'); const vParam = params.get('versions');
  const effScope = sParam && allScopes.has(sParam) ? sParam : null;
  const effVers = vParam && allVersions.has(vParam) ? vParam : null;

  const rows = React.useMemo(()=>{
    const _q = q.toLowerCase();
    return sampleCampaigns.filter(c=>{
      if (effScope && c.scope !== effScope) return false;
      if (effVers && c.versions !== effVers) return false;
      if (status && c.status !== status) return false;
      if (_q && !(c.name.toLowerCase().includes(_q))) return false;
      return true;
    });
  }, [q, status, effScope, effVers]);

  const [selected, setSelected] = React.useState(null);
  const columns = React.useMemo(()=> gridView.orderColumns(buildColumns()), [gridView.snapshot.columns.order]);

  return (
    <Box>
      <SavedViewBar title="Attestations" gridView={gridView} columnsList={columnsList} presets={[]} />
      <Stack direction="row" spacing={2} sx={{ my: 1 }} alignItems="center">
        <TextField size="small" label="Search" value={q} onChange={(e)=> {
          const u = new URLSearchParams(params); u.set('q', e.target.value); history.replaceState(null, '', `${location.pathname}?${u.toString()}`);
        }} />
        <TextField size="small" select label="Status" value={status ?? ''} onChange={(e)=> setStatus(e.target.value || null)} sx={{ minWidth: 200 }}>
          <MenuItem value="">(Any)</MenuItem>
          <MenuItem value="planned">Planned</MenuItem>
          <MenuItem value="running">Running</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
          <MenuItem value="complete">Complete</MenuItem>
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
        onRowClick={setSelected}
      />
      <CampaignDrawer open={!!selected} onClose={()=> setSelected(null)} campaign={selected}/>
    </Box>
  );
}
