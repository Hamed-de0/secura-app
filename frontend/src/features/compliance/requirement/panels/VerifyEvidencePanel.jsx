import * as React from "react";
import { Box, Stack, TextField, Button, Alert, Typography } from "@mui/material";
import { appendEvidenceLifecycle } from "../../../../api/services/compliance";

export default function VerifyEvidencePanel({ evidenceId, onSuccess, onCancel }) {
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      await appendEvidenceLifecycle(evidenceId, { event: "verified", note: note || null });
      onSuccess?.({ message: "Evidence verified" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.25}>
        <Typography variant="body2">Verify evidence #{evidenceId}</Typography>
        <TextField
          label="Note (optional)"
          size="small"
          value={note}
          onChange={(e)=>setNote(e.target.value)}
          multiline
          minRows={2}
        />
        {err && <Alert severity="error">{String(err)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Verify"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
