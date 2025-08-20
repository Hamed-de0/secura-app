import React from 'react';
import { Chip } from '@mui/material';
import { getSourceChipProps, getAssuranceChipProps } from '../../theme/chips';

/**
 * Column defs are pure. We avoid valueGetter for code/title to prevent blank cells
 * when columns are cloned/reordered by grid helpers. We render directly from row.
 */
export const allColumns = {
  code: {
    field: 'code',
    headerName: 'Code',
    width: 120,
    renderCell: (params) => {
      const v = params?.row?.code ?? '';
      return <span>{v}</span>;
    },
  },
  title: {
    field: 'title',
    headerName: 'Control',
    flex: 1,
    minWidth: 260,
    renderCell: (params) => {
      const v = params?.row?.title ?? '';
      return <span>{v}</span>;
    },
  },
  assurance_status: {
    field: 'assurance_status',
    headerName: 'Assurance',
    width: 160,
    renderCell: (params) => {
      const val = params?.row?.assurance_status ?? '';
      const theme = params?.api?._context?.theme;
      const chipProps = theme ? getAssuranceChipProps(val, theme) : {};
      return <Chip size="small" label={val} {...chipProps} />;
    },
  },
  source: {
    field: 'source',
    headerName: 'Source',
    width: 140,
    renderCell: (params) => {
      const val = params?.row?.source ?? '';
      const theme = params?.api?._context?.theme;
      const chipProps = theme ? getSourceChipProps(val, theme) : {};
      return <Chip size="small" label={val} {...chipProps} />;
    },
  },
  req_count: {
    field: 'req_count',
    headerName: 'Req',
    width: 90,
    type: 'number',
    renderCell: (params) => {
      const n = Number(params?.row?.req_count ?? 0);
      return <span>{Number.isFinite(n) ? n : 0}</span>;
    },
  },
};

export const columnsList = [
  { id: 'code', label: 'Code' },
  { id: 'title', label: 'Control' },
  { id: 'assurance_status', label: 'Assurance' },
  { id: 'source', label: 'Source' },
  { id: 'req_count', label: 'Req' },
];

export function buildColumns() {
  return [
    allColumns.code,
    allColumns.title,
    allColumns.assurance_status,
    allColumns.source,
    allColumns.req_count,
  ];
}

export const defaultViewPreset = {
  columns: {
    visible: ['code', 'title', 'assurance_status', 'source', 'req_count'],
    order:   ['code', 'title', 'assurance_status', 'source', 'req_count'],
  },
  sort: [{ field: 'code', sort: 'asc' }],
  density: 'compact',
};

export const presets = [
  {
    id: 'summary',
    name: 'Summary',
    snapshot: defaultViewPreset,
  },
  {
    id: 'source-mapping',
    name: 'Source & mapping',
    snapshot: {
      columns: { visible: ['code','title','source','req_count'], order: ['code','title','source','req_count'] },
      sort: [{ field: 'code', sort: 'asc' }],
      density: 'compact',
    },
  },
];
