import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from '@mui/material';

export default function EvidenceAddDialog({ open, onClose, onAdd }) {
  const [filename, setFilename] = useState('');
  const [note, setNote] = useState('');
  const canAdd = filename.trim().length > 0;

  const submit = () => {
    onAdd?.(filename.trim(), note.trim());
    setFilename(''); setNote(''); onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Attach evidence</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Filename (mock)" value={filename} onChange={(e)=> setFilename(e.target.value)} />
          <TextField label="Note" value={note} onChange={(e)=> setNote(e.target.value)} multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!canAdd}>Attach</Button>
      </DialogActions>
    </Dialog>
  );
}
