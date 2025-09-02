import * as React from "react";
import { Box, Stack, TextField, MenuItem, List, ListItem, Chip, IconButton, Tooltip, Divider, Typography } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckIcon from "@mui/icons-material/Check";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const STATUS_COLOR = { valid:"#2e7d32", expired:"#d32f2f", unknown:"#9e9e9e" };

export default function EvidencePanel({ evidence, mappings, activeScope, onVerify, onUpload }) {
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState("all");
  const [type, setType] = React.useState("all");

  const list = React.useMemo(() => {
    let arr = Array.isArray(evidence) ? evidence : [];
    if (activeScope?.scopeType && activeScope?.scopeId != null) {
      const allowedLinks = new Set(
        (mappings||[]).flatMap(m => (m.contexts||[])
          .filter(c => c.scope_type===activeScope.scopeType && c.scope_id===activeScope.scopeId)
          .map(c => c.context_link_id))
      );
      arr = arr.filter(e => allowedLinks.has(e.control_context_link_id));
    }
    if (state !== "all") arr = arr.filter(e => (e.status||"unknown").toLowerCase() === state);
    if (type !== "all") arr = arr.filter(e => (e.type||"").toLowerCase() === type);
    if (q) arr = arr.filter(e => (e.title||"").toLowerCase().includes(q.toLowerCase()));
    return arr;
  }, [evidence, mappings, activeScope, state, type, q]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
        <TextField size="small" placeholder="Search evidence…" value={q} onChange={e=>setQ(e.target.value)} />
        <TextField size="small" select label="State" value={state} onChange={e=>setState(e.target.value)}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="valid">Valid</MenuItem>
          <MenuItem value="expired">Expired</MenuItem>
          <MenuItem value="unknown">Unknown</MenuItem>
        </TextField>
        <TextField size="small" select label="Type" value={type} onChange={e=>setType(e.target.value)}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="url">URL</MenuItem>
          <MenuItem value="file">File</MenuItem>
          <MenuItem value="text">Text</MenuItem>
        </TextField>
      </Stack>

      <List dense disablePadding>
        {list.map((ev, idx) => (
          <React.Fragment key={ev.evidence_id}>
            <ListItem sx={{ py: 0.75 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
                {/* LEFT: text */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap title={ev.title}>{ev.title}</Typography>

                  {/* Line 1: date range (YYYY-MM-DD → YYYY-MM-DD) */}
                  {(ev.collected_at || ev.valid_until) && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"          // ⬅️ force block
                    >
                      {fmtYMD(ev.collected_at)} → {fmtYMD(ev.valid_until)}
                    </Typography>
                  )}

                  {/* Line 2: context (always below dates) */}
                  {ev.control_context_link_id && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"          // ⬅️ force block
                      sx={{ mt: 0.25 }}        // subtle spacing
                    >
                      ctx#{ev.control_context_link_id}
                    </Typography>
                  )}
                </Box>


                {/* RIGHT: actions */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip size="small" label={ev.status || "unknown"} sx={{ bgcolor: STATUS_COLOR[(ev.status||"unknown")], color:"#fff" }} />
                  {ev.url && (
                    <Tooltip title="Open link">
                      <IconButton size="small" href={ev.url} target="_blank" rel="noopener"><CloudDownloadIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Verify">
                    <IconButton size="small" onClick={()=>onVerify(ev.evidence_id)}><CheckIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Upload/replace file">
                    <IconButton size="small" onClick={()=>onUpload(ev.evidence_id)}><UploadFileIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </ListItem>
            {idx < list.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {list.length === 0 && <Box sx={{ p: 1 }}><em>No evidence matches the filters.</em></Box>}
      </List>
    </Box>
  );
}

function fmtYMD(s) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  } catch {}
  // fallback if backend already sends YYYY-MM-DD
  return String(s).slice(0, 10);
}
