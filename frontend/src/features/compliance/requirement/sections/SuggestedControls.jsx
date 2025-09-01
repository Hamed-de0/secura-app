import * as React from "react";
import { List, ListItem, ListItemText, Stack, Button, Chip } from "@mui/material";

export default function SuggestedControls({ items, onAddMapping }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return <em>No suggestions right now.</em>;
  return (
    <List dense>
      {list.map(s => (
        <ListItem key={s.control_id}
          secondaryAction={<Button size="small" onClick={()=>onAddMapping(s.control_id)}>Add mapping</Button>}>
          <ListItemText
            primary={`${s.control_code || s.control_id} — ${s.title || ""}`}
            secondary={s.reason}
          />
          {typeof s.score === 'number' && <Stack direction="row" spacing={1}><Chip size="small" label={`Score ${s.score}`} /></Stack>}
        </ListItem>
      ))}
    </List>
  );
}
