import * as React from "react";
import { Box, Stack, TextField, MenuItem, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from "@mui/material";
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
      // filter by scope via mappings contexts
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
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
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

      <List dense>
        {list.map(ev => (
          <ListItem key={ev.evidence_id}
            secondaryAction={
              <Stack direction="row" spacing={1}>
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
            }
          >
            <ListItemText
              primary={ev.title}
              secondary={[
                ev.type && `Type: ${ev.type}`,
                ev.collected_at && `From: ${ev.collected_at}`,
                ev.valid_until && `To: ${ev.valid_until}`,
                ev.control_context_link_id && `ctx#${ev.control_context_link_id}`
              ].filter(Boolean).join(" • ")}
            />
            <Chip size="small" label={ev.status || "unknown"} sx={{ bgcolor: STATUS_COLOR[(ev.status||"unknown")], color:"#fff", ml: 1 }} />
          </ListItem>
        ))}
        {list.length === 0 && (
          <Box sx={{ p: 1 }}><em>No evidence matches the filters.</em></Box>
        )}
      </List>
    </Box>
  );
}
