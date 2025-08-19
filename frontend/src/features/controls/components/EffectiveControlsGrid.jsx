import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getSourceChipProps, getAssuranceChipProps } from '../../../theme/chips';

export default function EffectiveControlsGrid({
  rows = [],
  loading,
  onRowClick,
  // new controlled props (optional)
  columns: extColumns,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  sortingModel,
  onSortingModelChange,
  paginationModel,
  onPaginationModelChange,
  density,
}) {
  const theme = useTheme();

  const fallbackColumns = [
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'title', headerName: 'Control', flex: 1, minWidth: 260 },
    {
      field: 'source', headerName: 'Source', width: 140,
      renderCell: ({ value }) => <Chip size="small" label={value} {...getSourceChipProps(value, theme)} />
    },
    {
      field: 'assurance_status', headerName: 'Assurance', width: 160,
      renderCell: ({ value }) => <Chip size="small" label={value ?? ''} {...getAssuranceChipProps(value, theme)} />
    },
  ];

  const columns = extColumns?.length ? extColumns : fallbackColumns;

  const _rows = (rows || []).map((r, i) => ({ id: r.id ?? r.control_id ?? r.code ?? i, ...r }));

  return (
    <DataGrid
      rows={_rows}
      columns={columns}
      loading={loading}
      disableColumnMenu
      onRowClick={(params) => onRowClick?.(params.row)}
      pageSizeOptions={[10, 25, 50, 100]}
      // Controlled MUI binders (fallback to internal initial state if not provided)
      sortingMode="client"
      sortingOrder={["asc","desc"]}
      sortModel={sortingModel}
      onSortModelChange={onSortingModelChange}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={onColumnVisibilityModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      density={density}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'code', sort: 'asc' }] }
      }}
    />
  );
}