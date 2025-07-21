import React, { useState } from 'react';
import {
  TextField, Button, Checkbox, FormControlLabel, Box, Typography
} from '@mui/material';
import axios from 'axios';
import configs from '../configs'; 

const PersonForm = ({ onSuccess, person = null }) => {
  const [form, setForm] = useState({
    first_name: person?.first_name || 'John',
    last_name: person?.last_name || 'Doe',
    email: person?.email || 'john.doe@example.com',
    department: person?.department || 'IT',
    job_title: person?.job_title || 'SysAdmin',
    location: person?.location || 'Head Office',
    phone: person?.phone || '+49 123 456789',
    notes: person?.notes || 'Test person for asset assignment',
    enabled: person?.enabled ?? true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = person
        ? `${configs.API_BASE_URL}/persons/${person.id}`
        : `${configs.API_BASE_URL}/persons`;
      const method = person ? 'put' : 'post';

      await axios[method](url, form);
      onSuccess?.();
      alert('Person saved successfully.');
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('Error saving person.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {person ? 'Edit Person' : 'Add New Person'}
      </Typography>

      <TextField fullWidth name="first_name" label="First Name" value={form.first_name} onChange={handleChange} margin="normal" required />
      <TextField fullWidth name="last_name" label="Last Name" value={form.last_name} onChange={handleChange} margin="normal" required />
      <TextField fullWidth name="email" label="Email" value={form.email} onChange={handleChange} margin="normal" />
      <TextField fullWidth name="department" label="Department" value={form.department} onChange={handleChange} margin="normal" />
      <TextField fullWidth name="job_title" label="Job Title" value={form.job_title} onChange={handleChange} margin="normal" />
      <TextField fullWidth name="location" label="Location" value={form.location} onChange={handleChange} margin="normal" />
      <TextField fullWidth name="phone" label="Phone" value={form.phone} onChange={handleChange} margin="normal" />
      <TextField fullWidth name="notes" label="Notes" value={form.notes} onChange={handleChange} margin="normal" multiline rows={3} />
      <FormControlLabel
        control={<Checkbox checked={form.enabled} onChange={handleChange} name="enabled" />}
        label="Enabled"
      />

      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        {person ? 'Update' : 'Create'}
      </Button>
    </Box>
  );
};

export default PersonForm;
