import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function GridTable({
  rows = [],
  columns = [],
  loading = false,
  onRowClick,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  sortingModel,
  onSortingModelChange,
  paginationModel,
  onPaginationModelChange,
  density,
}) {
  return (
    <div style={{ width: '100%', height: 520 }}>
      <DataGrid
        rows={Array.isArray(rows) ? rows : []}
        getRowId={(r) => r.id ?? `${r.code || r.name || 'row'}-${Math.random()}`}
        columns={columns}
        loading={loading}
        onRowClick={(p) => onRowClick?.(p.row)}
        disableRowSelectionOnClick
        density={density}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        sortingModel={sortingModel}
        onSortingModelChange={onSortingModelChange}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
