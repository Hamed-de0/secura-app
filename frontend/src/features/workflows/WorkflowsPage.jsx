import * as React from "react";
import { Box, Stack, Button, Typography, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { listDefinitions, ensureSeed, createBlankDefinition, upsertDefinition } from "../../api/services/workflows";

export default function WorkflowsPage() {
  const nav = useNavigate();
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    ensureSeed();
    setRows(listDefinitions().map(d => ({
      id: d.id,
      name: d.name,
      version: d.version ?? 1,
      status: d.status ?? "draft",
      nodes: d.nodes?.length ?? 0,
      edges: d.edges?.length ?? 0,
      updated_at: d.updated_at,
    })));
  }, []);

  const handleNew = () => {
    const def = createBlankDefinition();
    upsertDefinition(def);
    nav(`/workflows/designer/${def.id}`);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "version", headerName: "Ver", width: 80 },
    { field: "status", headerName: "Status", width: 120, renderCell: p => <Chip size="small" label={p.value} /> },
    { field: "nodes", headerName: "Nodes", width: 90 },
    { field: "edges", headerName: "Edges", width: 90 },
    { field: "updated_at", headerName: "Updated", width: 180 },
    {
      field: "actions", headerName: "", width: 140, sortable: false, renderCell: (p) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => nav(`/workflows/designer/${p.row.id}`)}>Edit</Button>
        </Stack>
      )
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Workflows</Typography>
        <Button variant="contained" onClick={handleNew}>New</Button>
      </Stack>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        density="compact"
        hideFooterSelectedRowCount
        pageSizeOptions={[5,10,25]}
        initialState={{ pagination:{ paginationModel:{ pageSize:10 } } }}
      />
    </Box>
  );
}
