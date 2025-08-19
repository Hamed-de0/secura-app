import React from 'react';


export const allColumns = {
  code: { field: 'code', headerName: 'Code', width: 110 },
  title: { field: 'title', headerName: 'Requirement', flex: 1, minWidth: 260 },
  score: { field: 'score', headerName: 'Score', width: 110, valueFormatter: ({ value }) => `${Math.round((value ?? 0) * 100)}%` },
  hits_count: { field: 'hits_count', headerName: 'Hits', width: 90 },
  mapped_count: { field: 'mapped_count', headerName: 'Mapped', width: 110 },
};

export const columnsList = [
  { id: 'code', label: 'Code' },
  { id: 'title', label: 'Requirement' },
  { id: 'score', label: 'Score' },
  { id: 'hits_count', label: 'Hits' },
  { id: 'mapped_count', label: 'Mapped' },
];

export const defaultViewPreset = {
  columns: { visible: ['code','title','score','hits_count','mapped_count'], order: ['code','title','score','hits_count','mapped_count'] },
  sort: [],
  pagination: { pageSize: 10 },
  density: 'standard',
  filters: {},
};

export function buildColumns() { return Object.values(allColumns); }

export const presets = [
  {
    id: 'coverage',
    name: 'Coverage view',
    snapshot: {
      columns: { visible: ['code','title','mapped_count','hits_count'], order: ['code','title','mapped_count','hits_count'] },
      sort: [{ field: 'mapped_count', sort: 'desc' }],
      density: 'compact',
    },
  },
  {
    id: 'scoring',
    name: 'Scoring view',
    snapshot: {
      columns: { visible: ['code','title','score'], order: ['code','title','score'] },
      sort: [{ field: 'score', sort: 'desc' }],
    },
  },
];