import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Slider,
  Chip,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Stack,
} from "@mui/material";
import axios from "axios"; // adjust if needed
import configs from '../configs'; // adjust based on your actual configs
import { SCOPE_TYPES, STATUSES, LIFECYCLE_OPTIONS, IMPACT_DOMAINS, LOOKUP_ENDPOINTS } from "../../app/constants";

export default function AssignRiskContextModal({ open, onClose, riskScenarioId, onAssigned }) {
  const [scopeType, setScopeType] = useState("asset");
  const [targets, setTargets] = useState([]);
  const [targetOptions, setTargetOptions] = useState([]);
  const [status, setStatus] = useState("Open");
  const [likelihood, setLikelihood] = useState(3);
  const [lifecycleStates, setLifecycleStates] = useState([]);
  const [impactRatings, setImpactRatings] = useState([]);

  
  // Fetch available domains and targets
  useEffect(() => {
    if (!open) return;

    const ratings = IMPACT_DOMAINS.map((d) => ({ domain_id: d.id, domain_name: d.name, score: 0 }));
    setImpactRatings(ratings);
    // Load impact domains
    console.log("Impact Ratings:", scopeType, ratings);
    // Load target options (assets, groups, tags...)
    console.log("URL:", `${configs.API_BASE_URL}${LOOKUP_ENDPOINTS[scopeType]}`);
    axios.get(`${configs.API_BASE_URL}${LOOKUP_ENDPOINTS[scopeType]}`).then((res) => {
      setTargetOptions(res.data); // assumes [{ id, name }]
    });
  }, [scopeType, open]);

  const handleImpactChange = (domain_id, score) => {
    setImpactRatings((prev) =>
      prev.map((r) => (r.domain_id === domain_id ? { ...r, score } : r))
    );
  };

  const handleSubmit = async () => {
    const payload = {
      risk_scenario_id: riskScenarioId,
      scope_type: scopeType,
      target_ids: targets,
      likelihood,
      
      status,
      lifecycle_states: lifecycleStates,
      impact_ratings: impactRatings.map(({ domain_id, score }) => ({ domain_id, score })),
    };

    try {
        console.log("Assigning payload:", payload);
      await axios.post(`${configs.API_BASE_URL}/risks/risk_scenario_contexts/batch-assign`, payload);
      onAssigned?.();
      onClose();
    } catch (err) {
      console.error("Error assigning scenario:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Assign Risk Scenario</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <FormControl fullWidth>
            <InputLabel>Scope Type</InputLabel>
            <Select value={scopeType} onChange={(e) => setScopeType(e.target.value)} label="Scope Type">
              {SCOPE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Targets</InputLabel>
            <Select
              multiple
              value={targets}
              onChange={(e) => setTargets(e.target.value)}
              input={<OutlinedInput label="Targets" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const name = targetOptions.find((t) => t.id === id)?.name || id;
                    return <Chip key={id} label={name} />;
                  })}
                </Box>
              )}
            >
              {targetOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
          >
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography gutterBottom>Likelihood: {likelihood}</Typography>
            <Slider
              value={likelihood}
              onChange={(e, val) => setLikelihood(val)}
              min={1}
              max={5}
              step={1}
              marks
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Lifecycle States</InputLabel>
            <Select
              multiple
              value={lifecycleStates}
              onChange={(e) => setLifecycleStates(e.target.value)}
              input={<OutlinedInput label="Lifecycle States" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {selected.map((val) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {LIFECYCLE_OPTIONS.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Impact Ratings
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={2}>
              {impactRatings.map((r) => (
                <FormControl key={r.domain_id} sx={{ minWidth: 120 }}>
                  <InputLabel>{r.domain_name}</InputLabel>
                  <Select
                    value={r.score}
                    onChange={(e) => handleImpactChange(r.domain_id, e.target.value)}
                    label={r.domain_name}
                  >
                    {[0, 1, 2, 3, 4, 5].map((score) => (
                      <MenuItem key={score} value={score}>
                        {score}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

