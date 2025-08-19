import * as React from 'react';
import { Chip } from '@mui/material';
export const columnsList = [
  { id:'name', label:'Vendor' },
  { id:'tier', label:'Tier' },
  { id:'owner', label:'Owner' },
  { id:'status', label:'Status' },
  { id:'nextReview', label:'Next review' },
  { id:'questionnaires', label:'Questionnaires' },
];

export const defaultViewPreset = {
  columns: { visible: columnsList.map(c=>c.id), order: columnsList.map(c=>c.id) },
  sort: [{ field: 'name', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q:'', tier:null, status:null },
};

function TierChip({ v }) {
  const map = { critical:'error', high:'warning', medium:'default', low:'default' };
  return <Chip size="small" color={map[v]||'default'} variant="outlined" label={v||''}/>;
}
function StatusChip({ v }) {
  const map = { active:'success', pending:'warning', inactive:'default' };
  return <Chip size="small" color={map[v]||'default'} variant="outlined" label={v||''}/>;
}

export function buildColumns() {
  const cols = [
    { field:'name', headerName:'Vendor', flex:1, minWidth:220, renderCell:(p)=> p.row?.name ?? '' },
    { field:'tier', headerName:'Tier', width:120, renderCell:(p)=> <TierChip v={p.row?.tier}/> },
    { field:'owner', headerName:'Owner', width:220, renderCell:(p)=> p.row?.owner ?? '' },
    { field:'status', headerName:'Status', width:140, renderCell:(p)=> <StatusChip v={p.row?.status}/> },
    { field:'nextReview', headerName:'Next review', width:140, renderCell:(p)=> p.row?.nextReview ?? '' },
    { field:'questionnaires', headerName:'Questionnaires', width:200, renderCell:(p)=> (p.row?.questionnaires||[]).join(', ') },
  ];
  return Object.freeze([...cols]);
}
