import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import axios from 'axios';
import configs from '../../configs';

const AssignTagModal = ({ open, onClose, target }) => {
  const [tags, setTags] = useState([]);
  const [tagId, setTagId] = useState('');
  const [inTarget, setInTarget] = useState(null);

  useEffect(() => {
    if (open) {
      axios.get(`${configs.API_BASE_URL}/asset-tags/`).then(res => setTags(res.data));
    }
  }, [open]);

  useEffect(() => {
    if (target) {
      setInTarget(target);
    }
    
  }, [target]);


  const handleAssign = async () => {
    if (!tagId || !inTarget) return;
    try {
      if (inTarget.type === 'asset') {
        await axios.post(`${configs.API_BASE_URL}/asset-tags/assets/${inTarget.data.id}/tags/${tagId}`);
      } else if (inTarget.type === 'group') {
        await axios.post(`${configs.API_BASE_URL}/asset-tags/assign-tag-to-group/${inTarget.data.id}/${tagId}`);
      }

      onClose();
    } catch (err) {
      console.error("Tag assignment failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Assign Tag</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Select Tag"
          fullWidth
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
          sx={{ mt: 2 }}
        >
          {tags.map(tag => (
            <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} variant="contained">Assign</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignTagModal;
