import React from 'react';
import { Chip } from '@mui/material';
import { getSourceChipProps, getAssuranceChipProps } from '../../theme/chips';

// Column IDs must be stable; labels can change safely
export const allColumns = {
  code: { field: 'code', headerName: 'Code', width: 120,
    valueGetter: (p) => p.value ?? p.row?.code ?? p.row?.reference_code ?? '' },
  title: { field: 'title', headerName: 'Control', flex: 1, minWidth: 260,
    valueGetter: (p) => p.value ?? p.row?.title ?? p.row?.name ?? '' },
  source: { field: 'source', headerName: 'Source', width: 140,
    renderCell: ({ value }) => (
      <Chip size="small" label={value} {...getSourceChipProps(value)} />
    ) },
  assurance_status: { field: 'assurance_status', headerName: 'Assurance', width: 160,
    renderCell: ({ value }) => (
      <Chip size="small" label={value ?? ''} {...getAssuranceChipProps(value)} />
    ) },
};

export const columnsList = [
  { id: 'code', label: 'Code' },
  { id: 'title', label: 'Control' },
  { id: 'source', label: 'Source' },
  { id: 'assurance_status', label: 'Assurance' },
];

export const defaultViewPreset = {
  columns: { visible: ['code', 'title', 'source', 'assurance_status'], order: ['code','title','source','assurance_status'] },
  sort: [{ field: 'code', sort: 'asc' }],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: { q: '', source: null, assurance: null },
};


export function buildColumns(theme) {
  return [
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
      valueGetter: (p) =>
        p.value ?? p.row?.code ?? p.row?.reference_code ?? '',
    },
    {
      field: 'title',
      headerName: 'Control',
      flex: 1,
      minWidth: 260,
      valueGetter: (p) => p.value ?? p.row?.title ?? p.row?.name ?? '',
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 140,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value}
          {...getSourceChipProps(value, theme)}
        />
      ),
    },
    {
      field: 'assurance_status',
      headerName: 'Assurance',
      width: 160,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ?? ''}
          {...getAssuranceChipProps(value, theme)}
        />
      ),
    },
  ];
}