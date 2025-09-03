import * as React from "react";
import {
  Box, Stack, Typography, TextField, MenuItem,
  RadioGroup, FormControlLabel, Radio, Button, Alert, CircularProgress
} from "@mui/material";
import { getJSON, postJSON } from "../../../../api/httpClient";

function ymd(d = new Date()) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

// --- NEW: per-scope source map (easy to override later) ---
/**
 * For each scope_type:
 *  - path: GET endpoint path (string)
 *  - buildParams(versionId, q): return URLSearchParams for the request
 *  - labelKeys: preferred name fields in response rows
 *  - idKey: field for id (optional; we try common fallbacks too)
 */

// --- NEW: per-scope endpoints (exact) ---------------------------------------
// helper: list source with optional label keys / id key / search key
function srcList(path, { labelKeys = ["name","title"], idKey = "id", searchKey = "q" } = {}) {
  return {
    path,
    buildParams(_versionId, q) {
      const sp = new URLSearchParams();
      if (q) sp.set(searchKey, q);
      sp.set("limit", "50"); sp.set("offset", "0"); // safe defaults
      return sp;
    },
    labelKeys,
    idKey,
  };
}

const SCOPE_SOURCES = {
  org:         srcList("org/groups"),
  entity:      srcList("org/entities"),
  bu:          srcList("org/business-units", { labelKeys: ["name","title","code"] }),
  service:     srcList("org/services"),
  site:        srcList("org/sites"),
  asset_group: srcList("asset_groups"),
  asset_type:  srcList("asset_types"),
  tag:         srcList("asset_tag",     { labelKeys: ["name","label","title"] }),
  asset:       srcList("assets",        { labelKeys: ["name","hostname","title"] }),
};

function extractControlIds(mappings) {
  const ids = new Set();
  if (!mappings) return [];
  if (Array.isArray(mappings.control_links)) {
    mappings.control_links.forEach(l => {
      const v = Number(l?.control_id ?? l?.control?.id);
      if (Number.isFinite(v)) ids.add(v);
    });
  }
  if (Array.isArray(mappings.controls)) {
    mappings.controls.forEach(c => {
      const v = Number(c?.id ?? c?.control_id);
      if (Number.isFinite(v)) ids.add(v);
    });
  }
  if (Array.isArray(mappings.items)) {
    mappings.items.forEach(it => {
      const v = Number(it?.control_id ?? it?.control?.id);
      if (Number.isFinite(v)) ids.add(v);
    });
  }
  return Array.from(ids);
}

function pick(obj, keys, fallback) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return fallback;
}

function unwrapList(rows) {
  if (Array.isArray(rows)) return rows;
  return rows?.items || rows?.results || rows?.data || rows?.rows || [];
}


function normalizeScopeRows(rows, type, idKey, labelKeys) {
    const out = [];
    unwrapList(rows).forEach(r => {
    const id = Number(r?.[idKey] ?? r?.id);
    const name = pick(r, labelKeys, `${type} #${id}`);
    if (Number.isFinite(id)) out.push({ id, type, name });
  });
  // de-dupe by id
  const seen = new Set();
  return out.filter(o => !seen.has(o.id) && seen.add(o.id));
}

/**
 * Props:
 * - requirementId, versionId
 * - scopeType, scopeId         (defaults)
 * - mappings                   (for control ids)
 * - onCancel()
 * - onSuccess(payload)
 */
export default function SoAQuickAssignPanel({
  requirementId, versionId, scopeType, scopeId, mappings,
  onCancel, onSuccess
}) {
  const [loading, setLoading] = React.useState(true);

  const [scopeTypes, setScopeTypes] = React.useState([]);
  const [targetType, setTargetType] = React.useState(scopeType || "org");

  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const [scopeOptions, setScopeOptions] = React.useState([]); // {id,name,type}[]
  const [q, setQ] = React.useState("");                       // search text
  const [qDebounced, setQDebounced] = React.useState("");

  const [targetId, setTargetId] = React.useState(scopeId || "");
  const [applicability, setApplicability] = React.useState("applicable"); // "applicable" | "na"
  const [justification, setJustification] = React.useState("");
  const [controlIds, setControlIds] = React.useState([]);
  const [error, setError] = React.useState("");

  // Debounce search input
  React.useEffect(() => {
    const id = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [q]);

  // initial: scope types  mapped controls
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const st = await getJSON("scopes/types");
        if (alive) setScopeTypes(st || []);
      } catch (_) { /* ignore */ }
      const ids = extractControlIds(mappings);
      if (alive) setControlIds(ids);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [mappings]);

  // load scope options when type or search changes (fetch exact endpoints)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      const src = SCOPE_SOURCES[targetType];
      if (!src || !versionId) {
        if (alive) setScopeOptions([]);
        return;
      }
      setOptionsLoading(true);
      try {
        const sp = src.buildParams(versionId, qDebounced);
        const rows = await getJSON(src.path, { searchParams: sp });
        let opts = normalizeScopeRows(rows, targetType, src.idKey, src.labelKeys);
        // Client-side filter by q (for endpoints without server-side search)
        if (qDebounced) {
          opts = opts.filter(o => o.name.toLowerCase().includes(qDebounced));
        }
        if (alive) {
          setScopeOptions(opts);
          if (targetId && !opts.some(o => String(o.id) === String(targetId))) {
            setTargetId("");
          }
        }
      } catch (e) {
        console.error(e);
        if (alive) setScopeOptions([]);
      } finally {
        if (alive) setOptionsLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetType, versionId, qDebounced]);

  async function handleApply() {
    setError("");
    if (!targetType || !targetId) return setError("Select target scope type and scope.");
    if (!controlIds.length) return setError("No mapped controls found for this requirement.");
    if (applicability === "na" && !justification.trim()) return setError("Justification is required for N/A.");

    const decided_at = ymd();
    const rows = controlIds.map(control_id => ({
      scope_type: targetType,
      scope_id: Number(targetId),
      control_id,
      applicability,
      justification: applicability === "na" ? justification.trim() : undefined,
      decided_at
    }));

    try {
      await Promise.all(rows.map(row => postJSON("compliance/soa", row)));
      onSuccess?.({ count: rows.length, requirementId, versionId, targetType, targetId, applicability });
    } catch (e) {
      console.error(e);
      setError("Apply failed.");
    }
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="overline">Assign requirement to scope</Typography>

      {loading ? (
        <Typography sx={{ mt: 2 }}>Loading…</Typography>
      ) : (
        <>
          {error && <Alert severity="error" sx={{ mt: 1, mb: 2 }}>{error}</Alert>}

          {/* Row: type  search */}
          <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
            <TextField
              select fullWidth size="small"
              label="Target scope type"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
            >
              {(scopeTypes || []).map((s) => {
                const val = s?.scope_type || s;
                const label = s?.title || val;
                return <MenuItem key={val} value={val}>{label}</MenuItem>;
              })}
            </TextField>

            <TextField
              fullWidth size="small"
              label="Search scopes"
              placeholder="Type to filter by name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Stack>

          {/* Row: scope dropdown (names) */}
          <TextField
            select fullWidth size="small"
            label={optionsLoading ? "Loading scopes…" : "Target scope"}
            value={String(targetId || "")}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={optionsLoading}
            SelectProps={{
              renderValue: (v) => {
                const opt = scopeOptions.find(o => String(o.id) === String(v));
                return opt ? opt.name : "";
              }
            }}
            helperText={scopeOptions.length === 0 ? "No scopes found." : " "}
            InputProps={{
              endAdornment: optionsLoading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null
            }}
            sx={{ mb: 2 }}
          >
            {scopeOptions.map(o => (
              <MenuItem key={o.id} value={String(o.id)}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="overline" sx={{ mb: 1 }}>Applicability</Typography>
          <RadioGroup
            row
            value={applicability}
            onChange={(e) => setApplicability(e.target.value)}
          >
            <FormControlLabel value="applicable" control={<Radio />} label="Applicable" />
            <FormControlLabel value="na" control={<Radio />} label="N/A (not applicable)" />
          </RadioGroup>

          {applicability === "na" && (
            <TextField
              fullWidth size="small" multiline minRows={2}
              sx={{ mt: 1 }}
              label="Justification (required for N/A)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          )}

          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            Will apply to <b>{controlIds.length}</b> mapped control(s). Decision date: {ymd()}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button onClick={onCancel} variant="text">Cancel</Button>
            <Button onClick={handleApply} variant="contained" disabled={!targetId}>Apply</Button>
          </Stack>
        </>
      )}
    </Box>
  );
}
