import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

export default function RiskTable({
  rows = [],
  loading,
  onRowClick,
  columns: extColumns,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  sortingModel,
  onSortingModelChange,
  paginationModel,
  onPaginationModelChange,
  density,
}) {
  const fallbackColumns = [
    { field: "title", headerName: "Risk", flex: 1, minWidth: 240 },
    { field: "owner", headerName: "Owner", width: 120 },
    { field: "status", headerName: "Status", width: 140, renderCell: (p) => (<Chip size="small" label={p?.value ?? ""} variant="outlined" />) },
    { field: "residual_level", headerName: "Residual", width: 100, type: "number" },
    { field: "linked_controls", headerName: "Controls", width: 110, valueGetter: (p = {}) => { const v = p.value ?? p.row?.linked_controls; return Array.isArray(v) ? v.length : 0; } },
  ];

  const columns = extColumns?.length ? extColumns : fallbackColumns;
  const dgRows = (rows || []).map((r, i) => ({ id: r.id ?? r.risk_id ?? i, ...r }));

  return (
    <DataGrid
      rows={dgRows}
      columns={columns}
      loading={loading}
      disableColumnMenu
      onRowClick={(params) => onRowClick?.(params.row)}
      pageSizeOptions={[10, 25, 50, 100]}
      sortModel={sortingModel}
      onSortModelChange={onSortingModelChange}
      columnVisibilityModel={columnVisibilityModel}
      onColumnVisibilityModelChange={onColumnVisibilityModelChange}
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      density={density}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
    />
  );
}