import React, {useEffect} from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Stack, Typography, TextField, Button, Chip, Slider,
  MenuItem, Divider, Autocomplete, CircularProgress
} from "@mui/material";
import { createCrosswalkMapping, updateCrosswalkMapping } from "../../../api/services/mappings";

// Simple uuid (good enough for idempotency keys)
function uuid4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

/**
 * MappingDialog
 * props:
 *  - open, mode: "create" | "edit"
 *  - requirement: { requirement_id, code, title }
 *  - control:     { control_id, code, title }      // required in create
 *  - initial:     mapping row when editing (has mapping_id, weight, relation_type, etc.)
 *  - obligationAtoms?: [{ id, code, name }]        // optional; shows select when provided
 *  - remainingWeight?: number                      // hint for default weight
 *  - onClose()
 *  - onSaved(resultRow)                            // call after successful save
 */
export default function MappingDialog({
  open,
  mode = "create",
  requirement,
  control,
  initial,
  obligationAtoms = [],
  remainingWeight = 100,
  onClose,
  onSaved,
}) {
  const isEdit = mode === "edit";
  const req = requirement || {};
  const ctl = control || {};
  const init = initial || {};

  // whether this requirement/framework uses atoms
  const hasAtoms = Array.isArray(obligationAtoms) && obligationAtoms.length > 0;

  // --- form state ------------------------------------------------------------
  const [atomId, setAtomId] = React.useState(init.obligation_atom_id ?? null);
  const [relationType, setRelationType] = React.useState(init.relation_type || (hasAtoms ? "satisfies" : "supports"));
  const [weight, setWeight] = React.useState(
    isEdit ? Number(init.weight ?? 0) : Math.max(0, Math.min(100, Number(remainingWeight ?? 100)))
  );
  const [coverageLevel, setCoverageLevel] = React.useState(init.coverage_level || "auto");
  const [evidenceHints, setEvidenceHints] = React.useState(
    Array.isArray(init.evidence_hints) ? init.evidence_hints : []
  );
  const [rationale, setRationale] = React.useState(init.rationale || "");
  const [notes, setNotes] = React.useState(init.notes || "");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  // --- validation ------------------------------------------------------------
  const badWeight = !(Number.isFinite(weight) && weight >= 0 && weight <= 100);
  const needAtom = hasAtoms ? false /* optional by default */ : false; // flip to true if you decide to require atom
  const invalid = badWeight || (needAtom && !atomId);

  // --- useEffect -------------------------------------------------------------
  // RESET STATE WHEN OPENING OR SWITCHING ROW/MODE
    useEffect(() => {
        if (!open) return;

        const i = initial || {};
        const usesAtoms = Array.isArray(obligationAtoms) && obligationAtoms.length > 0;

        setAtomId(i.obligation_atom_id ?? null);
        setRelationType(i.relation_type || (usesAtoms ? "satisfies" : "supports"));
        setWeight(
            mode === "edit"
            ? Number(i.weight ?? 0)
            : Math.max(0, Math.min(100, Number(remainingWeight ?? 100)))
        );
        setCoverageLevel(i.coverage_level ?? "auto");
        setEvidenceHints(Array.isArray(i.evidence_hints) ? i.evidence_hints : []);
        setRationale(i.rationale || "");
        setNotes(i.notes || "");
        setError("");
        setSaving(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [
        open,
        mode,
        initial?.mapping_id,
        initial?.control_id,
        requirement?.requirement_id,
        control?.control_id,
        remainingWeight,
        obligationAtoms
    ]);



  // --- submit ----------------------------------------------------------------
  async function handleSave() {
    setSaving(true);
    setError("");

    // Build payload: omit noisy/empty fields
    const payload = {
      framework_requirement_id: req.requirement_id,
      control_id: isEdit ? init.control_id : ctl.control_id,
      weight: Number.isFinite(weight) ? Number(weight) : 0,
      relation_type: relationType || undefined,
      obligation_atom_id: atomId || undefined,
      coverage_level: coverageLevel === "auto" ? undefined : coverageLevel || undefined,
      evidence_hint: evidenceHints && evidenceHints.length ? evidenceHints : undefined,
      rationale: rationale?.trim() ? rationale.trim() : undefined,
      notes: notes?.trim() ? notes.trim() : undefined,
    };

    try {
      let savedRow = null;
      if (isEdit && init.mapping_id) {
        // PATCH preferred, with DELETE+POST fallback inside the service
        savedRow = await updateCrosswalkMapping(init.mapping_id, payload);
      } else {
        savedRow = await createCrosswalkMapping(payload, { idempotencyKey: uuid4() });
      }
      if (onSaved) onSaved(savedRow || null);
    } catch (e) {
      setError(e?.message || "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
        key={`${mode}-${initial?.mapping_id ?? "new"}-${control?.control_id ?? ""}-${requirement?.requirement_id ?? ""}`} 
        open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Edit Mapping" : "Map Control → Requirement"}</DialogTitle>
      <DialogContent dividers>
        {/* Context header */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">Requirement</Typography>
            <Chip size="small" label={req?.code || "—"} />
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{req?.title || "—"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">Control</Typography>
            <Chip size="small" label={(isEdit ? initial?.control_code : ctl?.code) || "—"} />
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {(isEdit ? initial?.control_title : ctl?.title) || "—"}
            </Typography>
          </Stack>
        </Stack>

        {/* Form */}
        <Stack spacing={2}>
          {hasAtoms && (
            <TextField
              select
              fullWidth
              size="small"
              label="Obligation (optional)"
              value={atomId ?? ""}
              onChange={(e) => setAtomId(e.target.value ? Number(e.target.value) : null)}
              helperText="Select a specific obligation when relevant (GDPR/DORA); leave empty for requirement-level mapping."
            >
              <MenuItem value="">— None —</MenuItem>
              {obligationAtoms.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.code ? `${a.code} — ${a.name || ""}` : (a.name || `Atom #${a.id}`)}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            size="small"
            label="Relation type"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value)}
            sx={{ maxWidth: 280 }}
          >
            {["supports", "satisfies", "overlaps", "mitigates"].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Weight</Typography>
              <Slider
                value={weight}
                min={0}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                onChange={(_, v) => setWeight(Array.isArray(v) ? v[0] : v)}
              />
            </Box>
            <TextField
              size="small"
              type="number"
              label="%"
              value={weight}
              onChange={(e) => setWeight(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              inputProps={{ min: 0, max: 100, style: { width: 80, textAlign: "right" } }}
            />
            <Stack direction="row" spacing={1}>
              {[100, 70, 50, 25].map((p) => (
                <Button key={p} size="small" variant="outlined" onClick={() => setWeight(p)}>{p}%</Button>
              ))}
            </Stack>
          </Stack>

          <TextField
            select
            size="small"
            label="Coverage level"
            value={coverageLevel}
            onChange={(e) => setCoverageLevel(e.target.value)}
            sx={{ maxWidth: 280 }}
            helperText='Use "auto" to let the server infer from weight.'
          >
            {["auto", "full", "partial", "none"].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={evidenceHints}
            onChange={(_, val) => setEvidenceHints(val)}
            renderInput={(params) => (
              <TextField {...params} size="small" label="Evidence hints" placeholder="Type and press Enter" />
            )}
          />

          <TextField
            size="small"
            label="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            multiline
            minRows={2}
          />
          <TextField
            size="small"
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
          />
        </Stack>

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={invalid || saving}
          startIcon={saving ? <CircularProgress size={16} /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
