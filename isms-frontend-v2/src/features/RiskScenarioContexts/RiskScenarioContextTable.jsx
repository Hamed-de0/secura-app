// RiskScenarioContextTable.jsx
import React from "react";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { Box, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import useRiskScenarioContextData from "./useRiskScenarioContextData";

export default function RiskScenarioContextTable() {
  const {
    data,
    loading,
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    handleDelete,
  } = useRiskScenarioContextData();

  const columns = [
    { field: "scenario_title", headerName: "Scenario", flex: 2 },
    { field: "scope_type", headerName: "Scope Type", flex: 1 },
    { field: "scope_name", headerName: "Scope Name", flex: 2 },
    { field: "status", headerName: "Status", flex: 1, renderCell: ({ value }) => (
      <Chip label={value} size="small" color="info" />
    )},
    { field: "likelihood", headerName: "Likelihood", type: "number", flex: 1 },

    // Dynamically show impact domains
    {
      field: "impacts",
      headerName: "Impact Ratings",
      flex: 3,
      renderCell: ({ value }) =>
        value ? (
          <Box>
            {Object.entries(value).map(([domain, score]) => (
              <Chip
                key={domain}
                label={`${domain[0].toUpperCase() + domain.slice(1)}: ${score}`}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        ) : null,
    },

    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View"
          onClick={() => console.log("View", params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={data}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={pageSize}
        rowCount={total}
        paginationMode="server"
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        pagination
        disableSelectionOnClick
      />
    </Box>
  );
}
