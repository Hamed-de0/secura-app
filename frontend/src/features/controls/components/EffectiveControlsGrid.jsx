import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getSourceChipProps, getAssuranceChipProps } from '../../../theme/chips';

export default function EffectiveControlsGrid({ rows = [], loading }) {
  const theme = useTheme();

  const columns = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'title', headerName: 'Control', flex: 1, minWidth: 260 },
    {
      field: 'source', headerName: 'Source', width: 140,
      renderCell: ({ value }) => <Chip size="small" label={value} {...getSourceChipProps(value, theme)} />
    },
    {
      field: 'assurance_status', headerName: 'Assurance', width: 160,
      renderCell: ({ value }) => <Chip size="small" label={value} {...getAssuranceChipProps(value, theme)} />
    },
    { field: 'notes', headerName: 'Notes', flex: 1, minWidth: 240 }
  ];

  const _rows = rows.map(r => ({ id: r.control_id, ...r }));

  return (
    <DataGrid
      rows={_rows}
      columns={columns}
      loading={loading}
      disableColumnMenu
      pageSizeOptions={[10, 25, 50]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'code', sort: 'asc' }] }
      }}
    />
  );
}
