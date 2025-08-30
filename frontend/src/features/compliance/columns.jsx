import * as React from 'react';
import { Chip, Stack, LinearProgress, Box } from '@mui/material';
import StatusChip from '../../components/ui/StatusChip.jsx';

export const registerColumnsList = [
  { id: 'code' }, { id: 'title' }, { id: 'breadcrumb' }, { id: 'status' }, { id: 'score' },
];

export const defaultViewPreset = {
  columns: {
    visible: ['code','title','breadcrumb','status','score'],
    widths:  { code: 120, title: 260, breadcrumb: 240, status: 120, score: 140 },
  },
  sort: [{ field: 'code', sort: 'asc' }],
  density: 'compact',
};

export function buildColumns() {
  return [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'title', headerName: 'Requirement', flex: 1, minWidth: 260 },
    { field: 'breadcrumb', headerName: 'Path', width: 240, sortable: false, valueGetter: (p) => p.row.breadcrumb || '' },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (p) => <StatusChip value={p.row.status} exception={p.row.exception_applied} /> },
    {
      field: 'score', headerName: 'Score', width: 140,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={Math.round((p.value || 0) * 100)} sx={{ flex: 1, height: 8, borderRadius: 1 }} />
          <Box sx={{ minWidth: 36, textAlign: "right" }}>{Math.round((p.value || 0) * 100)}%</Box>
        </Stack>
      ),
      sortComparator: (a,b) => a - b,
    },
  ];
}
