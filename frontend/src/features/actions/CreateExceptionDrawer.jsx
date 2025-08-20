import * as React from 'react';
import { Drawer, Box, Stack, TextField, Typography, Button, MenuItem } from '@mui/material';

const IMPACT = ['low', 'medium', 'high'];

export default function CreateExceptionDrawer({ open, onClose, onCreate, preset }) {
  const [form, setForm] = React.useState({ title: '', owner: '', impact: 'medium', riskCode: '', expires: '' });

  React.useEffect(() => {
    if (open) setForm((f) => ({ ...f, riskCode: preset?.riskCode || '' }));
  }, [open, preset]);

  const disabled = !form.title || !form.owner;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 440 } }}>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Create exception</Typography>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField label="Title" value={form.title} onChange={(e)=> setForm({ ...form, title: e.target.value })} />
          <TextField label="Related risk (optional)" value={form.riskCode} onChange={(e)=> setForm({ ...form, riskCode: e.target.value })} placeholder="e.g. RISK-23" />
          <TextField label="Owner" value={form.owner} onChange={(e)=> setForm({ ...form, owner: e.target.value })} />
          <TextField label="Impact" select value={form.impact} onChange={(e)=> setForm({ ...form, impact: e.target.value })}>
            {IMPACT.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Expires" InputLabelProps={{ shrink: true }} value={form.expires} onChange={(e)=> setForm({ ...form, expires: e.target.value })} />
          <TextField label="Reason" multiline minRows={3} value={form.reason || ''} onChange={(e)=> setForm({ ...form, reason: e.target.value })} />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" disabled={disabled} onClick={() => onCreate?.(form)}>Create</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
