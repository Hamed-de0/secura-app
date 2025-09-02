import * as React from "react";
import {
  Box, Stack, TextField, MenuItem, Button, Alert, Typography
} from "@mui/material";
import { createCrosswalk } from "../../../../api/services/compliance";

const RELATION_TYPES = ["implements", "supports", "compensating", "related"];
const COVERAGE_LEVELS = ["full", "partial", "n/a"];

export default function AddMappingPanel({
  requirementId,                  // required
  controlId,                      // optional prefill
  rationale: initialRationale="", // optional prefill (e.g., suggestion reason)
  onSuccess,
  onCancel
}) {
  const [control_id, setControlId] = React.useState(controlId || "");
  const [relation_type, setRelationType] = React.useState("implements");
  const [coverage_level, setCoverageLevel] = React.useState("partial");
  const [weight, setWeight] = React.useState(100);
  const [rationale, setRationale] = React.useState(initialRationale || "");
  const [notes, setNotes] = React.useState("");
  const [obligation_atom_id, setObligationAtomId] = React.useState("");
  const [applicabilityRaw, setApplicabilityRaw] = React.useState("{}"); // JSON string
  const [evidenceHintRaw, setEvidenceHintRaw] = React.useState("");      // comma-separated
  const [err, setErr] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);

  const canSubmit = Boolean(requirementId && control_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    let applicability = {};
    try {
      if (applicabilityRaw.trim()) applicability = JSON.parse(applicabilityRaw);
    } catch {
      setErr("Applicability must be valid JSON.");
      return;
    }
    const evidence_hint = evidenceHintRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    setErr(null);
    try {
      await createCrosswalk({
        framework_requirement_id: requirementId,
        control_id: Number(control_id),
        obligation_atom_id: obligation_atom_id ? Number(obligation_atom_id) : null,
        relation_type,
        coverage_level,
        applicability,
        evidence_hint,
        rationale: rationale || "",
        weight,
        notes
      });
      onSuccess?.({ message: "Mapping added" });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Failed to add mapping");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.25}>
        <Typography variant="body2" color="text.secondary">
          Map control to requirement #{requirementId}
        </Typography>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Requirement"
            size="small"
            value={String(requirementId)}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Control ID"
            size="small"
            value={control_id}
            onChange={(e)=>setControlId(e.target.value)}
            required
            helperText="Numeric control id"
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <TextField
            label="Relation"
            size="small"
            select
            value={relation_type}
            onChange={(e)=>setRelationType(e.target.value)}
          >
            {RELATION_TYPES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>

          <TextField
            label="Coverage"
            size="small"
            select
            value={coverage_level}
            onChange={(e)=>setCoverageLevel(e.target.value)}
          >
            {COVERAGE_LEVELS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>

          <TextField
            label="Weight"
            size="small"
            type="number"
            value={weight}
            onChange={(e)=>setWeight(Number(e.target.value))}
            inputProps={{ min: 0, max: 100 }}
          />
        </Stack>

        <TextField
          label="Rationale"
          size="small"
          value={rationale}
          onChange={(e)=>setRationale(e.target.value)}
          multiline
          minRows={2}
        />

        <TextField
          label="Notes"
          size="small"
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          multiline
          minRows={2}
        />

        <Stack direction="row" spacing={1}>
          <TextField
            label="Obligation atom id (optional)"
            size="small"
            value={obligation_atom_id}
            onChange={(e)=>setObligationAtomId(e.target.value)}
          />
          <TextField
            label="Evidence hints (comma-separated)"
            size="small"
            value={evidenceHintRaw}
            onChange={(e)=>setEvidenceHintRaw(e.target.value)}
            placeholder="policy, logs, ticket link"
          />
        </Stack>

        <TextField
          label="Applicability (JSON)"
          size="small"
          value={applicabilityRaw}
          onChange={(e)=>setApplicabilityRaw(e.target.value)}
          multiline
          minRows={2}
          helperText='Example: {"scope_type":"org","scope_id":1}'
        />

        {err && <Alert severity="error">{String(err)}</Alert>}

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onCancel}>Cancel</Button>
          <Button size="small" variant="contained" type="submit" disabled={!canSubmit || submitting}>
            {submitting ? "Adding…" : "Add mapping"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
