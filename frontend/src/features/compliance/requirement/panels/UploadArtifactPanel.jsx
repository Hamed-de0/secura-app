import * as React from "react";
import { Box, Stack, Button, Alert, Typography } from "@mui/material";
import { uploadEvidenceArtifact } from "../../../../api/services/compliance";

export default function UploadArtifactPanel({ evidenceId, onSuccess, onCancel }) {
  const [file, setFile] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setErr(null);
    try {
      await uploadEvidenceArtifact(evidenceId, file);
      onSuccess?.({ message: "Artifact uploaded" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.25}>
        <Typography variant="body2">Attach/replace file for evidence #{evidenceId}</Typography>
        <Button variant="outlined" component="label" size="small">
          {file ? `Selected: ${file.name}` : "Choose file"}
          <input type="file" hidden onChange={(e)=>setFile(e.target.files?.[0] || null)} />
        </Button>
        {err && <Alert severity="error">{String(err)}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" disabled={!file || submitting} type="submit">
            {submitting ? "Uploading…" : "Upload"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
