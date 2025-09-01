import * as React from "react";
import { List, ListItem, ListItemText, Chip } from "@mui/material";

export default function ExceptionsPanel({ exceptions }) {
  const items = Array.isArray(exceptions) ? exceptions : [];
  return (
    <List dense>
      {items.map(ex => (
        <ListItem key={ex.id}
          secondaryAction={ex.status ? <Chip size="small" label={ex.status} /> : null}>
          <ListItemText
            primary={ex.title || `Exception #${ex.id}`}
            secondary={[
              ex.scope_type && `${ex.scope_type}#${ex.scope_id}`,
              ex.expires_at && `Expires: ${ex.expires_at}`,
              ex.reason
            ].filter(Boolean).join(" • ")}
          />
        </ListItem>
      ))}
      {items.length === 0 && <em style={{ padding: 8 }}>No exceptions.</em>}
    </List>
  );
}
