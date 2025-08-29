import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, FormControlLabel, Checkbox,
  Snackbar, Alert
} from '@mui/material';
import { exceptionsCreate, exceptionsSubmit } from '../../../api/services/exceptions';

export default function RiskAcceptanceDialog({ open, onClose, contextId, onSubmitted }) {
  const [rationale, setRationale] = React.useState('');
  const [expiry, setExpiry] = React.useState(''); // YYYY-MM-DD
  const [controls, setControls] = React.useState('');
  const [ack, setAck] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [snack, setSnack] = React.useState({ open: false, severity: 'success', message: '' });

  const reset = () => {
    setRationale(''); setExpiry(''); setControls(''); setAck(false); setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const canSubmit = Boolean(rationale && ack && !busy && contextId);

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setBusy(true);
      const today = new Date();
      const yyyyMmDd = today.toISOString().slice(0, 10);
      const payload = {
        title: 'Risk Acceptance',
        risk_acceptance_ref: true,
        risk_scenario_context_id: contextId,
        reason: rationale,
        start_date: yyyyMmDd,
        end_date: expiry || null,
        compensating_controls: controls || null,
      };
      const created = await exceptionsCreate(payload);
      const id = created?.id;
      if (id) await exceptionsSubmit(id);
      setSnack({ open: true, severity: 'success', message: 'Risk accepted.' });
      // allow toast to display briefly, then close
      setTimeout(() => {
        onSubmitted?.(created);
        handleClose();
      }, 900);
    } catch (e) {
      setSnack({ open: true, severity: 'error', message: 'Failed to accept risk.' });
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Accept risk</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Expiry"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            fullWidth
          />
          <TextField
            label="Compensating controls"
            value={controls}
            onChange={(e) => setControls(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <FormControlLabel
            control={<Checkbox checked={ack} onChange={(e) => setAck(e.target.checked)} />}
            label="I acknowledge this acceptance and its implications."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canSubmit}>
          Submit
        </Button>
      </DialogActions>
      <Snackbar
        open={snack.open}
        autoHideDuration={1200}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

