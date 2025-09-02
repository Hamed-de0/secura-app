import * as React from "react";
import { Box, List, ListItem, ListItemText, Stack, Chip, Collapse, IconButton, Divider, Tooltip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const STATUS_COLOR = { met:"#2e7d32", partial:"#ed6c02", gap:"#d32f2f", unknown:"#9e9e9e" };

export default function MappingsControls({ mappings, onAddEvidence }) {
  const [open, setOpen] = React.useState(() => new Set());
  const toggle = (id) => setOpen(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const items = Array.isArray(mappings) ? mappings : [];

  return (
    <List disablePadding>
      {items.map((m, idx) => {
        const expanded = open.has(m.control_id);
        const ctxs = m.contexts || [];
        const ctxCount = ctxs.length;
        const lastDate = ctxs.map(c => c.last_evidence_at).filter(Boolean).sort().slice(-1)[0] || null;
        const status = majorityStatus(ctxs);

        return (
          <React.Fragment key={m.control_id}>
            <ListItem sx={{ py: 1 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
                {/* LEFT: text */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" noWrap title={`${m.control_code} — ${m.title}`}>
                    {m.control_code} — {m.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lastDate ? `Last evidence: ${fmtDate(lastDate)}` : "No evidence yet"}
                  </Typography>
                </Box>

                {/* RIGHT: actions */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip size="small" label={`${ctxCount} ctx`} />
                  <Chip size="small" label={status.toUpperCase()} sx={{ bgcolor: STATUS_COLOR[status], color:"#fff" }} />
                  <IconButton size="small" onClick={() => toggle(m.control_id)}>
                    {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                  </IconButton>
                </Stack>
              </Stack>
            </ListItem>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 2, pb: 1 }}>
                {(ctxs).map((ctx) => (
                  <ListItem key={ctx.context_link_id} sx={{ py: 0.5 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
                      {/* LEFT: context text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2">
                          {ctx.scope_type} • {ctx.scope_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ctx.last_evidence_at ? `Last: ${fmtDate(ctx.last_evidence_at)}` : "No evidence"}
                        </Typography>
                      </Box>

                      {/* RIGHT: context actions */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Chip size="small" label={`${ctx.evidence_count} ev`} />
                        <Chip size="small" label={ctx.status} sx={{ bgcolor: STATUS_COLOR[ctx.status], color:"#fff" }} />
                        <Tooltip title="Add evidence to this context">
                          <Chip size="small" variant="outlined" label="Add evidence" onClick={() => onAddEvidence(ctx.context_link_id)} />
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </ListItem>
                ))}
              </Box>
            </Collapse>

            {idx < items.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </List>
  );
}

function majorityStatus(ctxs) {
  const tally = { met:0, partial:0, gap:0, unknown:0 };
  for (const c of ctxs) tally[c.status] = (tally[c.status]||0)+1;
  return Object.entries(tally).sort((a,b)=>b[1]-a[1])[0][0] || "unknown";
}
function fmtDate(s){ try{ return new Date(s).toISOString().slice(0,10);}catch{return String(s)} }
