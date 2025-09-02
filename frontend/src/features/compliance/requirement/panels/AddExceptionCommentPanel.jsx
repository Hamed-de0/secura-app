import * as React from "react";
import { Box, Stack, TextField, Button, Alert } from "@mui/material";
import { addExceptionComment } from "../../../../api/services/compliance";

export default function AddExceptionCommentPanel({ exceptionId, currentUser, onSuccess, onCancel }) {
  const [author, setAuthor] = React.useState(currentUser?.email || currentUser?.id || "ui");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const canSubmit = author && body.trim();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setErr(null);
    try {
      await addExceptionComment(exceptionId, { author, body: body.trim() });
      onSuccess?.({ message: "Comment added" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Failed to add comment");
    } finally { setSubmitting(false); }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.25}>
        <TextField size="small" label="Author" value={author} onChange={(e)=>setAuthor(e.target.value)} />
        <TextField size="small" label="Comment" value={body} onChange={(e)=>setBody(e.target.value)} multiline minRows={3} />
        {err && <Alert severity="error">{String(err)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Saving…" : "Add comment"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
