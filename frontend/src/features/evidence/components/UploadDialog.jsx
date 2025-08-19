import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export default function UploadDialog({ open, onClose, onSubmit }) {
  const [name, setName] = React.useState('');
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upload evidence (mock)</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth margin="dense" label="File name" value={name} onChange={(e)=> setName(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={()=> { onSubmit?.({ name }); setName(''); onClose(); }}>Upload</Button>
      </DialogActions>
    </Dialog>
  );
}
