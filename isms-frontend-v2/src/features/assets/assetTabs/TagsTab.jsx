import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, TextField, MenuItem, Button, Stack
} from '@mui/material';
import axios from 'axios';
import configs from '../../configs';

const TagsTab = ({ assetId }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [assignedTags, setAssignedTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    fetchAvailableTags();
    fetchAssignedTags();
  }, [assetId]);

  const fetchAvailableTags = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/asset-tags/`);
      setAvailableTags(res.data);
    } catch (err) {
      console.error('Failed to load tags', err);
    }
  };

  const fetchAssignedTags = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags`);
      setAssignedTags(res.data);
    } catch (err) {
      console.error('Failed to load assigned tags', err);
    }
  };

  const handleAssign = async () => {
    if (!selectedTagId) return;
    try {
      await axios.post(`${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags/${selectedTagId}`);
      setSelectedTagId('');
      fetchAssignedTags();
    } catch (err) {
      console.error('Error assigning tag:', err);
    }
  };

  const handleRemove = async (tagId) => {
    try {
      await axios.delete(`${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags/${tagId}`);
      fetchAssignedTags();
    } catch (err) {
      console.error('Error removing tag:', err);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Assigned Tags</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
        {assignedTags.map(tag => (
          <Chip
            key={tag.id}
            label={tag.name}
            color="primary"
            onDelete={() => handleRemove(tag.id)}
          />
        ))}
      </Stack>

      <Typography variant="subtitle2" gutterBottom>Add Tag to Asset</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          select
          label="Select Tag"
          value={selectedTagId}
          onChange={e => setSelectedTagId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {availableTags.map(tag => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={handleAssign}>Assign</Button>
      </Stack>
    </Box>
  );
};

export default TagsTab;
