import * as React from 'react';
import { Chip } from '@mui/material';

export const columnsList = [
  { id: 'code', label: 'ID' },
  { id: 'title', label: 'Exception' },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'impact', label: 'Impact' },
  { id: 'expires', label: 'Expires' },
];

export const defaultViewPreset = {
  columns: { visible: columnsList.map(c=>c.id), order: columnsList.map(c=>c.id) },
  sort: [{ field: 'expires', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', status: null },
};

function StatusChip({ v }) {
  const map = { pending:'warning', approved:'success', rejected:'error' };
  return <Chip size="small" color={map[v] || 'default'} variant="outlined" label={v || ''} />;
}
function ImpactChip({ v }) {
  const map = { low:'default', medium:'warning', high:'error' };
  return <Chip size="small" color={map[v] || 'default'} variant="outlined" label={v || ''} />;
}

export function buildColumns() {
  const cols = [
    { field:'code', headerName:'ID', width:120, renderCell:(p)=> p.row?.code ?? '' },
    { field:'title', headerName:'Exception', flex:1, minWidth:240, renderCell:(p)=> p.row?.title ?? '' },
    { field:'owner', headerName:'Owner', width:220, renderCell:(p)=> p.row?.owner ?? '' },
    { field:'status', headerName:'Status', width:140, renderCell:(p)=> <StatusChip v={p.row?.status}/> },
    { field:'impact', headerName:'Impact', width:120, renderCell:(p)=> <ImpactChip v={p.row?.impact}/> },
    { field:'expires', headerName:'Expires', width:140, renderCell:(p)=> p.row?.expires ?? '' },
  ];
  return Object.freeze([...cols]);
}
