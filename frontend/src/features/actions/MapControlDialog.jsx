import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip, Stack, Autocomplete, Typography } from '@mui/material';

const REQUIREMENTS = [
  { code: 'A.8.1', title: 'Asset inventory' },
  { code: 'A.12.2', title: 'Change management' },
  { code: 'A.16.1', title: 'Incident management' },
  { code: 'CC6.6', title: 'Logical access' },
  { code: 'CC7.2', title: 'Logging and monitoring' },
];

export default function MapControlDialog({ open, onClose, onSave, preset }) {
  const [control, setControl] = React.useState(preset?.controlCode || '');
  const [selected, setSelected] = React.useState([]);

  React.useEffect(() => {
    if (open) { setControl(preset?.controlCode || ''); setSelected([]); }
  }, [open, preset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Map control to requirement(s)</DialogTitle>
      <DialogContent>
        <TextField label="Control code" value={control} onChange={(e)=> setControl(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <Autocomplete
          multiple options={REQUIREMENTS} value={selected} onChange={(_, v)=> setSelected(v)}
          getOptionLabel={(o)=> `${o.code} — ${o.title}`}
          renderInput={(p)=> <TextField {...p} label="Requirements" placeholder="Search…" />}
        />
        {selected.length > 0 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap:'wrap' }}>
            {selected.map((r) => <Chip key={r.code} label={r.code} />)}
          </Stack>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Mock-only for now. We’ll wire it to Mapping Manager later.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!control || selected.length === 0} onClick={() => onSave?.({ controlCode: control, requirements: selected })}>
          Save mapping
        </Button>
      </DialogActions>
    </Dialog>
  );
}
