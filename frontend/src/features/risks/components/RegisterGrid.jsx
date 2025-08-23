import * as React from "react";
import { Box, Paper, Typography, useTheme, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function RegisterGrid({
  rows,
  total = 0,
  loading = false,
  paginationModel,
  onPaginationModelChange,
}) {
  const theme = useTheme();

  const columns = React.useMemo(
    () => [
      { field: "scenario", headerName: "Scenario", flex: 1.4, minWidth: 200 },
      { field: "scope", headerName: "Scope", width: 120 },
      {
        field: "L",
        headerName: "L",
        width: 60,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "I",
        headerName: "I",
        width: 60,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "initial",
        headerName: "Initial",
        width: 90,
        align: "center",
        headerAlign: "center",
      },
      {
        field: "residual",
        headerName: "Residual",
        width: 100,
        align: "center",
        headerAlign: "center",
        renderCell: (p) => (
          <Chip
            size="small"
            label={p.value}
            sx={{
              color: theme.palette.getContrastText(theme.palette.primary.light),
              bgcolor: theme.palette.primary.light,
            }}
          />
        ),
      },
      { field: "owner", headerName: "Owner", width: 140 },
      { field: "status", headerName: "Status", width: 120 },
      { field: "updated", headerName: "Updated", width: 120 },
    ],
    [theme.palette]
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Risk Register
      </Typography>
      <Box sx={{ height: 360 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableColumnMenu
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
        />
      </Box>
    </Paper>
  );
}
