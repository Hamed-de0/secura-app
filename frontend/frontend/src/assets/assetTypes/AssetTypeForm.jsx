import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Box, FormControlLabel, Checkbox
} from '@mui/material';
import { createAssetType, updateAssetType } from '../api';

const AssetTypeForm = ({ initialData, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    enabled: true
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || '',
        description: initialData.description || '',
        enabled: initialData.enabled ?? true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = initialData
      ? updateAssetType(initialData.id, form)
      : createAssetType(form);

    req.then(onSuccess).catch(err => alert('Error saving asset type'));
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
        name="category"
        label="Category"
        fullWidth
        value={form.category}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
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
      <FormControlLabel
        control={
          <Checkbox
            name="enabled"
            checked={form.enabled}
            onChange={handleChange}
          />
        }
        label="Enabled"
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained">
        {initialData ? 'Update' : 'Create'}
      </Button>
    </Box>
  );
};

export default AssetTypeForm;
