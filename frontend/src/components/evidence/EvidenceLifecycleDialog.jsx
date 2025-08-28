import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Typography, Stack, Chip } from '@mui/material';
import { fetchEvidenceLifecycle } from '../../api/services/evidence';

export default function EvidenceLifecycleDialog({ open, evidenceId, onClose }) {
  const [loading, setLoading] = React.useState(false);
  const [events, setEvents] = React.useState([]);

  React.useEffect(() => {
    let alive = true;
    if (!open || !evidenceId) { setEvents([]); return; }
    setLoading(true);
    (async () => {
      try {
        const rows = await fetchEvidenceLifecycle(evidenceId);
        if (!alive) return;
        const list = Array.isArray(rows) ? rows : [];
        setEvents(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [open, evidenceId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Evidence lifecycle</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography variant="body2" color="text.secondary">Loading…</Typography>}
        {!loading && events.length === 0 && (
          <Typography variant="body2" color="text.secondary">No lifecycle events.</Typography>
        )}
        {!loading && events.length > 0 && (
          <List dense>
            {events.map((ev) => (
              <ListItem key={ev.id} divider>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={String(ev.event || '').toUpperCase()} />
                      <Typography variant="body2">{ev.actor_id ? `By #${ev.actor_id}` : ''}</Typography>
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary">
                        {ev.created_at ? new Date(ev.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : ''}
                      </Typography>
                      {ev.notes && (
                        <Typography variant="body2" sx={{ mt: .5 }}>{ev.notes}</Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

