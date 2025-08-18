import React from 'react';
import { Drawer, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function ActivityDrawer({ open, onClose, event }) {
  if (!open || !event) return null;

  const goto = (() => {
    if (event.entity?.kind === 'control') return `/controls?q=${encodeURIComponent(event.entity.code)}`;
    if (event.entity?.kind === 'requirement') return `/compliance/versions/1`; // you can refine later
    if (event.entity?.kind === 'risk') return `/risk-view`;
    return null;
  })();

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 420 } }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>{event.type}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display:'block', mb: 2 }}>
          {new Date(event.ts).toLocaleString()} · {event.user} · {event.scope}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {JSON.stringify(event, null, 2)}
        </Typography>

        {goto && (
          <Button component={RouterLink} to={goto} onClick={onClose} size="small">
            Open related page
          </Button>
        )}
      </Box>
    </Drawer>
  );
}
