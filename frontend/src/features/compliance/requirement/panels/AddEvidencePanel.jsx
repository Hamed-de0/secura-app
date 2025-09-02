import * as React from "react";
import { Box, Stack, TextField, RadioGroup, FormControlLabel, Radio, Button, Alert } from "@mui/material";
import { createEvidence, uploadEvidenceArtifact } from "../../../../api/services/compliance";

export default function AddEvidencePanel({ contextLinkId, scopeType, scopeId, onSuccess, onCancel, currentUser }) {
  const [mode, setMode] = React.useState("url"); // url | file | text
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [collectedAt, setCollectedAt] = React.useState(today());
  const [validUntil, setValidUntil] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState(null);

  const canSubmit = title.trim() && collectedAt && (
    (mode === "url" && url.trim()) ||
    (mode === "file" && !!file) ||
    (mode === "text" && text.trim())
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErr(null);

    try {
      // Build backend-compatible payload
      const payload = {
        control_context_link_id: Number(contextLinkId),
        title: title.trim(),
        description: mode === "text" ? text.trim() : (text.trim() || null),
        evidence_type: mode,                     // "url" | "file" | "text"
        evidence_url: mode === "url" ? url.trim() : null,
        file_path: null,                         // set by /evidence/{id}/artifact
        collected_at: collectedAt,
        valid_until: validUntil || null,
        status: "valid",
        created_by: currentUser?.email || currentUser?.id || "ui",
      };

      const evid = await createEvidence(payload);
      const evidenceId = evid?.id || evid?.evidence_id || evid?.data?.id;

      if (mode === "file" && file && evidenceId) {
        await uploadEvidenceArtifact(evidenceId, file);
      }

      onSuccess?.({ evidenceId, message: "Evidence added" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Failed to add evidence");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={1.25}>
        {contextLinkId && <TextField label="Context link" value={`ctx#${contextLinkId}`} size="small" disabled />}
        <TextField label="Title" size="small" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <RadioGroup row value={mode} onChange={(e)=>setMode(e.target.value)}>
          <FormControlLabel value="url"  control={<Radio size="small" />} label="URL" />
          <FormControlLabel value="file" control={<Radio size="small" />} label="File" />
          <FormControlLabel value="text" control={<Radio size="small" />} label="Text" />
        </RadioGroup>

        {mode === "url" && (
          <TextField label="URL" placeholder="https://…" size="small" value={url} onChange={(e)=>setUrl(e.target.value)} />
        )}
        {mode === "file" && (
          <Button variant="outlined" component="label" size="small">
            {file ? `Selected: ${file.name}` : "Choose file"}
            <input type="file" hidden onChange={(e)=>setFile(e.target.files?.[0] || null)} />
          </Button>
        )}
        {/* Optional description (also used as text content when mode === 'text') */}
        <TextField
          label={mode === "text" ? "Text content" : "Description (optional)"}
          size="small"
          multiline
          minRows={mode === "text" ? 3 : 2}
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />

        <Stack direction="row" spacing={1}>
          <TextField label="Collected at" type="date" size="small" value={collectedAt} onChange={(e)=>setCollectedAt(e.target.value)} required />
          <TextField label="Valid until" type="date" size="small" value={validUntil} onChange={(e)=>setValidUntil(e.target.value)} />
        </Stack>

        {err && <Alert severity="error">{String(err)}</Alert>}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Adding…" : "Add evidence"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function today() { return new Date().toISOString().slice(0,10); }
