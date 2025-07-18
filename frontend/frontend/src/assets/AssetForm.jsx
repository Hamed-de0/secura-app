import React, { useEffect, useState } from 'react';
import { TextField, Button, MenuItem, Box, Typography } from '@mui/material';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import configs from '../configs';

const AssetForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    uuid: uuidv4(),
    name: '',
    type_id: '',
    group_id: '',
    description: ''
  });

  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    axios.get(`${configs.API_BASE_URL}/asset-types`).then(res => setTypes(res.data));
    axios.get(`${configs.API_BASE_URL}/asset-groups`).then(res => setGroups(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${configs.API_BASE_URL}/assets`, form)
      .then(() => {
        alert('Asset created!');
        onSuccess?.(); // Optional: callback to refresh list
      })
      .catch(err => {
        console.error(err);
        alert('Error creating asset');
      });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>Create Asset</Typography>

      <TextField
        label="Name"
        name="name"
        fullWidth
        margin="normal"
        required
        value={form.name}
        onChange={handleChange}
      />

      <TextField
        label="Asset Type"
        name="type_id"
        fullWidth
        margin="normal"
        select
        required
        value={form.type_id}
        onChange={handleChange}
      >
        {types.map(type => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Asset Group"
        name="group_id"
        fullWidth
        margin="normal"
        select
        required
        value={form.group_id}
        onChange={handleChange}
      >
        {groups.map(group => (
          <MenuItem key={group.id} value={group.id}>
            {group.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Description"
        name="description"
        fullWidth
        margin="normal"
        multiline
        rows={4}
        value={form.description}
        onChange={handleChange}
      />

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default AssetForm;
