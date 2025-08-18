import React from 'react';
import { List, ListItem, ListItemText, Chip, Stack } from '@mui/material';
export default function EvidenceList({ items = [] }) {
  if (!items.length) return <em style={{ opacity: 0.7 }}>No evidence yet.</em>;
  return (
    <List dense sx={{ p: 0 }}>
      {items.map(ev => (
        <ListItem key={ev.id}>
          <ListItemText
            primary={ev.filename}
            secondary={`${new Date(ev.ts).toLocaleString()} · ${ev.uploaded_by}${ev.note ? ' — ' + ev.note : ''}`}
          />
          <Stack direction="row" spacing={0.5}>
            <Chip size="small" label="evidence" />
          </Stack>
        </ListItem>
      ))}
    </List>
  );
}
