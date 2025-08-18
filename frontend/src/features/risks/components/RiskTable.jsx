import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Chip, Stack } from '@mui/material';

export default function RiskTable({ rows = [], loading, onRowClick }) {
  const columns = [
    { field: 'title', headerName: 'Risk', flex: 1, minWidth: 240 },
    { field: 'owner', headerName: 'Owner', width: 120 },
    { field: 'status', headerName: 'Status', width: 140,
      renderCell: ({ value }) => <Chip size="small" label={value} variant="outlined" /> },
    { field: 'likelihood', headerName: 'L', width: 70 },
    { field: 'impact', headerName: 'I', width: 70 },
    { field: 'residual_level', headerName: 'Level', width: 90 },
    { field: 'residual_score', headerName: 'Residual', width: 100 },
    { field: 'linked_controls', headerName: 'Controls', width: 110,
      valueGetter: ({ value }) => (Array.isArray(value) ? value.length : 0) }
  ];

  const dgRows = (rows || []).map(r => ({ id: r.id, ...r }));

  return (
    <DataGrid
      rows={dgRows}
      columns={columns}
      loading={loading}
      disableColumnMenu
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } }, sorting: { sortModel: [{ field:'residual_score', sort:'desc'}] } }}
      onRowClick={(params) => onRowClick?.(params.row)}
    />
  );
}
