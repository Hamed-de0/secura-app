import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Box, MenuItem
} from '@mui/material';
import {
  createAssetGroup,
  updateAssetGroup,
  fetchAssetGroups
} from '../api';

const AssetGroupForm = ({ initialData, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    parent_id: '',
    description: ''
  });

  const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    fetchAssetGroups().then(res => setGroupOptions(res.data));

    if (initialData) {
      setForm({
        name: initialData.name || '',
        parent_id: initialData.parent_id || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isUpdate = !!initialData?.id;

    const req = isUpdate
      ? updateAssetGroup(initialData.id, form)
      : createAssetGroup(form);

    req.then(onSuccess).catch(err => {
      alert('Error saving asset group');
      console.error(err);
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        name="name"
        label="Name *"
        fullWidth
        required
        value={form.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <TextField
        name="parent_id"
        label="Parent Group"
        select
        fullWidth
        value={form.parent_id}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        <MenuItem value="">None</MenuItem>
        {groupOptions
          .filter(g => g.id !== initialData?.id) // don’t let group be its own parent
          .map(group => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
      </TextField>

      <TextField
        name="description"
        label="Description"
        fullWidth
        multiline
        rows={3}
        value={form.description}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained">
        {initialData?.id ? 'Update' : 'Create'}
      </Button>
    </Box>
  );
};

export default AssetGroupForm;
