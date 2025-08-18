import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

export default function RequirementsTable({ rows, onRowClick, loading }) {
  const columns = [
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'title', headerName: 'Requirement', flex: 1, minWidth: 260 },
    { field: 'score', headerName: 'Score', width: 110,
      valueFormatter: ({ value }) => `${Math.round((value ?? 0)*100)}%` },
    { field: 'hits_count', headerName: 'Hits', width: 90 },
    { field: 'mapped_count', headerName: 'Mapped', width: 110 }
  ];

  const _rows = (rows || []).map(r => ({ id: r.requirement_id, ...r }));

  return (
    <Box sx={{ height: 560, width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Requirements</Typography>
      <DataGrid
        rows={_rows}
        columns={columns}
        onRowClick={(params) => onRowClick?.(params.row)}
        loading={loading}
        disableColumnMenu
        pageSizeOptions={[10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </Box>
  );
}
