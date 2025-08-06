// RiskScenarioContextView.jsx
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import RiskScenarioContextToolbar from "./RiskScenarioContextToolbar";
import RiskScenarioContextTable from "./RiskScenarioContextTable";
import useRiskScenarioContextData from "./useRiskScenarioContextData";

export default function RiskScenarioContextView() {
    const { onFilterChange } = useRiskScenarioContextData();
    return (
        <Box p={2}>
        <Typography variant="h5" gutterBottom>
            Risk Scenario Assignments
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
            <RiskScenarioContextToolbar  onFilterChange={onFilterChange} />
        </Paper>

        <RiskScenarioContextTable />
        </Box>
    );
}
