import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Autocomplete, TextField, Button, Stack
} from '@mui/material';
import axios from 'axios';
import configs from '../../configs';

const TagsTab = ({ assetId }) => {
  const [availableTags, setAvailableTags] = useState([]);
  const [assignedTags, setAssignedTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

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
    if (!selectedTag || selectedTag === '') return;
    try {
        const tagName = typeof selectedTag === 'string' ? selectedTag : selectedTag.name;
        console.log('Assigning tag:', tagName);

      if (typeof selectedTag === 'string' || selectedTag.name) {
        // Create or assign tag via backend
        const res = await axios.post(
          `${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags/create-or-assign`,
          { name: selectedTag.name || selectedTag }
        );
        setSelectedTag(null);
        fetchAssignedTags();
      } else {
        // Assign existing tag
        await axios.post(`${configs.API_BASE_URL}/asset-tags/assets/${assetId}/tags/${selectedTag.id}`);
        setSelectedTag(null);
        fetchAssignedTags();
      }
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
        <Autocomplete
          freeSolo
          options={availableTags.filter(tag =>
            !assignedTags.some(assigned => assigned.id === tag.id)
          )}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
          value={selectedTag}
          onChange={(e, newValue) => setSelectedTag(newValue)}
          onInputChange={(e, inputValue) => setSelectedTag(inputValue)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Select or Add Tag" />}
        />

        <Button variant="contained" onClick={handleAssign}>Assign</Button>
      </Stack>
    </Box>
  );
};

export default TagsTab;
