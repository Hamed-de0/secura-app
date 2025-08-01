import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { createTag, updateTag } from './tagApi';

export default function TagForm({ open, onClose, tag, onSuccess }) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(tag?.name || '');
  }, [tag]);

  const handleSubmit = async () => {
    if (tag) {
      await updateTag(tag.id, { name });
    } else {
      await createTag({ name });
    }
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{tag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Tag Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
