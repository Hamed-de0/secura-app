// src/features/riskScenarios/RiskScenarioTable.jsx
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Button,
  Box,
  Link
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { getGroupedRiskScenarios } from "./api";
import AssignRiskContextModal from "../RiskScenarioContexts/AssignRiskContextModal";
import configs from '../configs';

const RiskScenarioTable = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getGroupedRiskScenarios()
      .then(setGroupedData)
      .catch((err) =>
        console.error("Error fetching grouped risk scenarios:", err)
      );
  }, []);

  const handleAssignClick = (id) => {
    setSelectedScenarioId(id);
    setShowAssign(true);
  };

  const getColumns = () => [
    {
      field: "title_en",
      headerName: "Title",
      flex: 2,
      renderCell: (params) => (
        <Link
          component={RouterLink}
          to={`/risk-scenarios/edit/${params.row.id}`}
          underline="hover"
          color="primary"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "threat_name",
      headerName: "Threat",
      flex: 1,
      renderCell: (params) => params.value || "–",
    },
    {
      field: "vulnerability_name",
      headerName: "Vulnerability",
      flex: 1,
      renderCell: (params) => params.value || "–",
    },
    {
      field: "likelihood",
      headerName: "Likelihood",
      flex: 1,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<AssignmentIcon />}
          label="Assign"
          onClick={() => handleAssignClick(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Risk Scenarios (Grouped by Category and Subcategory)
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/risk-scenarios/new")}
        sx={{ mb: 2 }}
      >
        Add New Risk Scenario
      </Button>

      {groupedData.map((category) => (
        <Accordion key={category.category_id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{category.category_name_en}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {category.subcategories.map((sub) => (
              <Accordion key={sub.subcategory_id} sx={{ mb: 1 }} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{sub.subcategory_name_en}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Box sx={{ height: 300, width: "100%" }}>
                    <DataGrid
                      columns={getColumns()}
                      rows={sub.scenarios}
                      getRowId={(row) => row.id}
                      hideFooter
                      disableRowSelectionOnClick
                      autoHeight
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <AssignRiskContextModal
        open={showAssign}
        onClose={() => setShowAssign(false)}
        riskScenarioId={selectedScenarioId}
      />
    </Paper>
  );
};

export default RiskScenarioTable;
