// src/features/workflows/NewWorkflowPanel.jsx
import * as React from "react";
import {
  Box, Stack, TextField, MenuItem, Button, Typography, Chip
} from "@mui/material";
import RightPanelDrawer from "../components/rightpanel/RightPanelDrawer.jsx";
import { useScope } from "../../providers/ScopeProvider";
import { createInstance } from "../../api/services/workflows.js";

const TEMPLATES = [
  { id: "exception_approval", label: "Exception approval" },
  { id: "evidence_request", label: "Evidence request" },
  { id: "risk_treatment", label: "Risk treatment" },
  { id: "custom", label: "Custom (empty)" },
];

export default function NewWorkflowPanel({ open, onClose }) {
  const { scope } = useScope();
  const [tpl, setTpl] = React.useState("exception_approval");
  const [title, setTitle] = React.useState("");
  const [due, setDue] = React.useState("");

  const handleStart = () => {
    const ctx = { scope_type: scope?.type || "org", scope_id: scope?.id || 1 };
    createInstance({
      defId: tpl,
      context: ctx,
      data: { title: title || TEMPLATES.find(t => t.id===tpl)?.label, due },
    });
    onClose?.();
  };

  return (
    <RightPanelDrawer
      open={open}
      onClose={onClose}
      title="Start workflow"
      maxWidth={480}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Scope: <Chip size="small" label={`${scope?.type || "org"}#${scope?.id || 1}`} />
        </Typography>

        <TextField
          select fullWidth size="small"
          label="Template"
          value={tpl}
          onChange={(e) => setTpl(e.target.value)}
        >
          {TEMPLATES.map(t => <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>)}
        </TextField>

        <TextField
          fullWidth size="small"
          label="Title"
          placeholder="Short title for this workflow run"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          fullWidth size="small"
          type="date"
          label="Due date"
          InputLabelProps={{ shrink: true }}
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />

        <Box sx={{ mt: 1 }}>
          <Button onClick={handleStart} variant="contained" fullWidth>
            Start
          </Button>
        </Box>
      </Stack>
    </RightPanelDrawer>
  );
}
