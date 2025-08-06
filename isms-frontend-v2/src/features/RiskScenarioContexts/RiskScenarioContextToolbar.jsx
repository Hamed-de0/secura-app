// RiskScenarioContextToolbar.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Stack,
} from "@mui/material";

const scopeTypes = ["All", "Asset", "Group", "Tag", "Type"];
const statuses = ["All", "Open", "Mitigated", "Accepted"];

export default function RiskScenarioContextToolbar({ onFilterChange }) {
  const [search, setSearch] = useState("");
  const [scopeType, setScopeType] = useState("All");
  const [status, setStatus] = useState("All");

  const handleApply = () => {
    onFilterChange({ search, scopeType, status });
  };

  const handleReset = () => {
    setSearch("");
    setScopeType("All");
    setStatus("All");
    onFilterChange({ search: "", scopeType: "All", status: "All" });
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
      <TextField
        label="Search..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <FormControl size="small">
        <InputLabel>Scope</InputLabel>
        <Select
          label="Scope"
          value={scopeType}
          onChange={(e) => setScopeType(e.target.value)}
        >
          {scopeTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button onClick={handleApply} variant="contained" size="small">
        Apply
      </Button>
      <Button onClick={handleReset} variant="outlined" size="small">
        Reset
      </Button>
    </Stack>
  );
}
