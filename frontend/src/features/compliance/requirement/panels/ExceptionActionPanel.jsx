import * as React from "react";
import { Box, Stack, Button, Typography, Alert } from "@mui/material";
import {
  submitException, approveException, rejectException, withdrawException
} from "../../../../api/services/compliance";

const ACTION_LABEL = {
  submit: "Submit",
  approve: "Approve",
  reject: "Reject",
  withdraw: "Withdraw",
};

export default function ExceptionActionPanel({ exceptionId, action, onSuccess, onCancel }) {
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const run = async () => {
    setSubmitting(true); setErr(null);
    try {
      switch (action) {
        case "submit":   await submitException(exceptionId); break;
        case "approve":  await approveException(exceptionId); break;
        case "reject":   await rejectException(exceptionId); break;
        case "withdraw": await withdrawException(exceptionId); break;
        default: throw new Error("Unknown action");
      }
      onSuccess?.({ message: `${ACTION_LABEL[action]}d` });
    } catch (e) {
      setErr(e?.detail || e?.message || "Action failed");
    } finally { setSubmitting(false); }
  };

  return (
    <Box>
      <Stack spacing={1.25}>
        <Typography variant="body2">
          {ACTION_LABEL[action]} exception <strong>#{exceptionId}</strong>?
        </Typography>
        {err && <Alert severity="error">{String(err)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" onClick={run} disabled={submitting}>
            {submitting ? `${ACTION_LABEL[action]}ing…` : ACTION_LABEL[action]}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
