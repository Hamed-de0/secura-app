import * as React from 'react';
import { Box, Stack, Button } from '@mui/material';
import GridTable from '../../../components/GridTable.jsx';
import SavedViewBar from '../../../components/SavedViewBar.jsx';
import useGridView from '../../../lib/views/useGridView';
import { useLocation, useSearchParams } from 'react-router-dom';
import { sampleSoA } from '../mocks.js';

const columnsList = [
  { id:'id', label:'Requirement' },
  { id:'title', label:'Title' },
  { id:'included', label:'Included' },
  { id:'rationale', label:'Rationale' },
  { id:'control', label:'Mapped control' },
];
const defaultViewPreset = {
  columns:{ visible: columnsList.map(c=>c.id), order: columnsList.map(c=>c.id) },
  sort:[{ field:'id', sort:'asc' }],
  pagination:{ pageSize: 10 },
  density:'standard',
  filters:{ q:'' },
};
function buildColumns() {
  const cols = [
    { field:'id', headerName:'Requirement', width:140, renderCell:(p)=> p.row?.id ?? '' },
    { field:'title', headerName:'Title', flex:1, minWidth:260, renderCell:(p)=> p.row?.title ?? '' },
    { field:'included', headerName:'Included', width:120, renderCell:(p)=> (p.row?.included ? 'Yes' : 'No') },
    { field:'rationale', headerName:'Rationale', flex:1, minWidth:220, renderCell:(p)=> p.row?.rationale ?? '' },
    { field:'control', headerName:'Mapped control', width:160, renderCell:(p)=> p.row?.control ?? '-' },
  ];
  return Object.freeze([...cols]);
}

export default function SoABuilder() {
  const [params] = useSearchParams();
  const location = useLocation();
  const scopeKey = React.useMemo(()=> {
    const sc = params.get('scope') || 'global'; const ver = params.get('versions') || 'current';
    return `scope=${sc};versions=${ver}`;
  }, [location.key]);

  const gridView = useGridView({
    key:'soa/builder@v1',
    defaults: defaultViewPreset,
    filterSchema:{ q:'' },
    columnIds: columnsList.map(c=>c.id),
    syncQueryParamQ:true,
    scopeKey,
  });

  const q = params.get('q') ?? '';
  React.useEffect(()=> gridView.setFilters({ q }), [q]); // eslint-disable-line

  const rows = React.useMemo(()=>{
    const _q = q.toLowerCase();
    return sampleSoA.filter(r=>{
      if (_q && !(r.id.toLowerCase().includes(_q) || r.title.toLowerCase().includes(_q))) return false;
      return true;
    });
  }, [q]);

  const columns = React.useMemo(()=> gridView.orderColumns(buildColumns()), [gridView.snapshot.columns.order]);

  function downloadCSV() {
    const header = ['Requirement','Title','Included','Rationale','Mapped control'];
    const lines = [header.join(',')].concat(
      rows.map(r=> [r.id, `"${r.title.replace(/"/g,'""')}"`, r.included?'Yes':'No', `"${(r.rationale||'').replace(/"/g,'""')}"`, r.control||''].join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'statement-of-applicability.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <Box>
      <SavedViewBar title="SoA Builder" gridView={gridView} columnsList={columnsList} presets={[]} />
      <Stack direction="row" spacing={1} sx={{ my: 1 }}>
        <Button size="small" variant="outlined" onClick={downloadCSV}>Export CSV</Button>
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
