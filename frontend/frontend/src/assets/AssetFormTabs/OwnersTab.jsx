import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, Dialog, DialogTitle,
  DialogContent, MenuItem, TextField, Stack
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import configs from '../../configs';

const OwnersTab = ({ assetId }) => {
  const [owners, setOwners] = useState([]);
  const [persons, setPersons] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    person_id: '',
    role: '',
    valid_from: '',
    valid_to: '',
    description: ''
  });

  const fetchOwners = async () => {
    const res = await axios.get(`${configs.API_BASE_URL}/asset-owners?asset_id=${assetId}`);
    setOwners(res.data);
  };

  const fetchPersons = async () => {
    const res = await axios.get(`${configs.API_BASE_URL}/persons`);
    setPersons(res.data);
  };

  useEffect(() => {
    fetchOwners();
    fetchPersons();
  }, [assetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAssign = async () => {
    try {
      const payload = {
        asset_id: assetId,
        ...form
      };
      await axios.post(`${configs.API_BASE_URL}/asset-owners/`, payload);
      setOpen(false);
      setForm({ person_id: '', role: '', valid_from: '', valid_to: '', description: '' });
      fetchOwners();
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  const handleRemove = async (ownerId) => {
    await axios.delete(`${configs.API_BASE_URL}/asset-owners/${ownerId}`);
    fetchOwners();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">Assigned Persons</Typography>
        <Button variant="outlined" onClick={() => setOpen(true)}>Assign Person</Button>
      </Box>

      {owners.map(owner => (
        <Box key={owner.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
          <span>{owner.person_full_name} ({owner.role})</span>
          <IconButton size="small" onClick={() => handleRemove(owner.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assign Person</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              fullWidth
              label="Person"
              name="person_id"
              value={form.person_id}
              onChange={handleChange}
            >
              {persons.map(p => (
                <MenuItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} ({p.email})
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Role" name="role" value={form.role} onChange={handleChange} />
            <TextField label="Valid From" name="valid_from" value={form.valid_from} onChange={handleChange} placeholder="YYYY-MM-DD" />
            <TextField label="Valid To" name="valid_to" value={form.valid_to} onChange={handleChange} placeholder="YYYY-MM-DD" />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={2} />

            <Button variant="contained" onClick={handleAssign}>
              Assign
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OwnersTab;
