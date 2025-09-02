import * as React from "react";
import {
  Box, Stack, TextField, MenuItem, Button, Alert, Typography
} from "@mui/material";
import { createException } from "../../../../api/services/compliance";

const STATUS_OPTIONS = ["draft", "open", "approved", "rejected", "closed"];

export default function CreateExceptionPanel({
  requirementId,              // REQUIRED
  controlId,                  // optional (prefill if launching from a control)
  riskScenarioContextId,      // optional
  currentUser,                // optional (to fill requested_by)
  onSuccess,
  onCancel
}) {
  // required / key fields
  const [title, setTitle] = React.useState("");
  const [reason, setReason] = React.useState("");

  // optional metadata
  const [description, setDescription] = React.useState("");
  const [riskRef, setRiskRef] = React.useState("");
  const [compControls, setCompControls] = React.useState("");
  const [owner, setOwner] = React.useState("");

  // dates & status
  const [startDate, setStartDate] = React.useState(today());
  const [endDate, setEndDate] = React.useState("");
  const [status, setStatus] = React.useState("draft");

  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const canSubmit = Boolean(title && startDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await createException({
        risk_scenario_context_id: riskScenarioContextId || 0,
        control_id: controlId || null,
        framework_requirement_id: requirementId,
        title: title.trim(),
        description: description?.trim() || "",
        reason: reason?.trim() || "",
        risk_acceptance_ref: riskRef?.trim() || "",
        compensating_controls: compControls?.trim() || "",
        requested_by: currentUser?.email || currentUser?.id || "ui",
        owner: owner?.trim() || "",
        start_date: startDate,
        end_date: endDate || null,
        status
      });
      onSuccess?.({ exception: res, message: "Exception created" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Failed to create exception");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.25}>
        <Typography variant="body2" color="text.secondary">
          Create exception for requirement #{requirementId}
        </Typography>

        <TextField
          label="Title"
          size="small"
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          required
        />

        <TextField
          label="Reason"
          size="small"
          value={reason}
          onChange={(e)=>setReason(e.target.value)}
          multiline
          minRows={2}
        />

        <TextField
          label="Description (optional)"
          size="small"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          multiline
          minRows={2}
        />

        <Stack direction="row" spacing={1}>
          <TextField
            label="Start date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e)=>setStartDate(e.target.value)}
            required
          />
          <TextField
            label="End date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e)=>setEndDate(e.target.value)}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Requested by"
            size="small"
            value={currentUser?.email || currentUser?.id || "ui"}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Owner"
            size="small"
            value={owner}
            onChange={(e)=>setOwner(e.target.value)}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Risk acceptance ref"
            size="small"
            value={riskRef}
            onChange={(e)=>setRiskRef(e.target.value)}
          />
          <TextField
            label="Compensating controls"
            size="small"
            value={compControls}
            onChange={(e)=>setCompControls(e.target.value)}
          />
        </Stack>

        <TextField
          label="Status"
          size="small"
          select
          value={status}
          onChange={(e)=>setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>

        {err && <Alert severity="error">{String(err)}</Alert>}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Creating…" : "Create exception"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function today() { return new Date().toISOString().slice(0,10); }
