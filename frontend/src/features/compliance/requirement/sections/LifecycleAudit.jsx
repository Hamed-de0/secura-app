import * as React from "react";
import { Box, Stack, Chip, List, ListItem, ListItemText, Button } from "@mui/material";
import { fetchRequirementTimeline } from "../../../../api/services/compliance";

export default function LifecycleAudit({ requirementId, versionId, scopeType, scopeId }) {
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async (nextPage) => {
    setLoading(true);
    try {
      const res = await fetchRequirementTimeline({
        requirementId, versionId, scopeType, scopeId, page: nextPage, size: 50,
        kinds: ['evidence','exception','mapping']
      });
      const data = res?.data ?? res;
      setItems(prev => nextPage === 1 ? data : prev.concat(data));
      setPage(nextPage);
    } finally { setLoading(false); }
  }, [requirementId, versionId, scopeType, scopeId]);

  React.useEffect(() => { load(1); }, [load]);

  return (
    <Box>
      <List dense>
        {items.map(ev => (
          <ListItem key={`${ev.id}-${ev.ts}`}>
            <ListItemText
              primary={`${fmtDateTime(ev.ts)} — ${ev.kind}:${ev.subtype}`}
              secondary={[
                ev.summary,
                ev.actor && `by ${ev.actor}`,
                ev.control_code && `control ${ev.control_code}`,
                ev.scope_type && `${ev.scope_type}#${ev.scope_id}`
              ].filter(Boolean).join(" • ")}
            />
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={ev.kind} />
            </Stack>
          </ListItem>
        ))}
      </List>
      <Stack direction="row" justifyContent="flex-end">
        <Button size="small" disabled={loading} onClick={()=>load(page+1)}>Load more</Button>
      </Stack>
    </Box>
  );
}

function fmtDateTime(s){ try{ return new Date(s).toLocaleString(); }catch{return String(s)} }
