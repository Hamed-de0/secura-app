import * as React from 'react';
import { Chip } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const columnsList = [
  { id: 'title', label: 'Request' },
  { id: 'object', label: 'Object' },
  { id: 'requestedBy', label: 'Requested by' },
  { id: 'dueDate', label: 'Due' },
  { id: 'status', label: 'Status' },
  { id: 'attachments', label: 'Files' },
];

export const defaultViewPreset = {
  columns: { visible: columnsList.map(c=>c.id), order: columnsList.map(c=>c.id) },
  sort: [{ field: 'dueDate', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', status: null },
};

function StatusChip({ v }) {
  const map = { new:'default', pending:'primary', overdue:'error', accepted:'success', rejected:'warning' };
  return <Chip size="small" color={map[v] || 'default'} variant="outlined" label={v || ''} />;
}

export function buildColumns() {
  const cols = [
    { field: 'title', headerName: 'Request', flex: 1, minWidth: 260, renderCell: (p)=> p.row?.title ?? '' },
    { field: 'object', headerName: 'Object', width: 200, renderCell: (p)=> `${p.row?.objectType||''} ${p.row?.objectCode||''}`.trim() },
    { field: 'requestedBy', headerName: 'Requested by', width: 220, renderCell: (p)=> p.row?.requestedBy ?? '' },
    { field: 'dueDate', headerName: 'Due', width: 140, renderCell: (p)=> p.row?.dueDate ?? '' },
    { field: 'status', headerName: 'Status', width: 140, renderCell: (p)=> <StatusChip v={p.row?.status}/> },
    { field: 'attachments', headerName: 'Files', width: 100, renderCell: (p)=> <Chip size="small" icon={<UploadFileIcon/>} label={String(p.row?.attachments ?? 0)} /> },
    { field: 'link', headerName: '', width: 56, renderCell: (p)=> p.row?.link ? <a href={p.row.link} aria-label="Open linked item"><LinkIcon fontSize="small"/></a> : null, sortable:false, disableColumnMenu:true },
  ];
  return Object.freeze([...cols]);
}
