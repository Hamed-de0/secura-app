import * as React from "react";
import { Box, Stack, TextField, MenuItem, Button, Alert } from "@mui/material";
import { assignRequirementOwner } from "../../../../api/services/compliance";

export default function AssignOwnerPanel({ requirementId, scopeType, scopeId, onSuccess, onCancel }) {
  const [userId, setUserId] = React.useState("");
  const [role, setRole] = React.useState("owner");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const canSubmit = userId;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr(null);
    try {
      await assignRequirementOwner(requirementId, {
        scope_type: scopeType || null,
        scope_id: scopeId ?? null,
        user_id: Number(userId) || userId, // allow numeric ID or email/slug if backend supports
        role,
      });
      onSuccess?.({ message: "Owner assigned" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Failed to assign owner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.25}>
        <TextField label="User ID (or email)" size="small" value={userId} onChange={(e)=>setUserId(e.target.value)} required />
        <TextField label="Role" size="small" select value={role} onChange={(e)=>setRole(e.target.value)}>
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="reviewer">Reviewer</MenuItem>
        </TextField>
        {err && <Alert severity="error">{String(err)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Assigning…" : "Assign"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
