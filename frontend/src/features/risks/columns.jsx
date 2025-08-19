import React from 'react';

import { Chip } from '@mui/material';

export const allColumns = {
  title: { field: 'title', headerName: 'Risk', flex: 1, minWidth: 240 },
  owner: { field: 'owner', headerName: 'Owner', width: 120 },
  status: { field: 'status', headerName: 'Status', width: 140, renderCell: (p) => <Chip size="small" label={p?.value ?? ''} variant="outlined"/> },
  residual_level: { field: 'residual_level', headerName: 'Residual', width: 100, type: 'number' },
  linked_controls: { field: 'linked_controls', headerName: 'Controls', width: 110, valueGetter: (p) => Array.isArray(p.value ?? p.row?.linked_controls) ? (p.value ?? p.row.linked_controls).length : 0 },
};

export const columnsList = [
  { id: 'title', label: 'Risk' },
  { id: 'owner', label: 'Owner' },
  { id: 'status', label: 'Status' },
  { id: 'residual_level', label: 'Residual' },
  { id: 'linked_controls', label: 'Controls' },
];

export const defaultViewPreset = {
  columns: { visible: ['title','owner','status','residual_level','linked_controls'], order: ['title','owner','status','residual_level','linked_controls'] },
  sort: [{ field: 'title', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', status: null, level: null },
};

export function buildColumns() { return Object.freeze([...Object.values(allColumns)]); }


export const presets = [
  {
    id: 'open-high',
    name: 'Open & High residual',
    snapshot: {
      columns: { visible: ['title','status','residual_level','owner'], order: ['title','status','residual_level','owner'] },
      sort: [{ field: 'residual_level', sort: 'desc' }],
      filters: { status: 'Open' },
      density: 'compact',
    },
  },
  {
    id: 'owner-focus',
    name: 'Owner focus',
    snapshot: {
      columns: { visible: ['title','owner','status'], order: ['title','owner','status'] },
      sort: [{ field: 'owner', sort: 'asc' }],
    },
  },
];