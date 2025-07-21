import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, Dialog, DialogTitle,
  DialogContent, MenuItem, TextField
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import configs from '../../configs';

const OwnersTab = ({ assetId }) => {
  const [owners, setOwners] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [open, setOpen] = useState(false);

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

  const handleAssign = async () => {
    try {
      await axios.post(`${configs.API_BASE_URL}/asset-owners/`, {
        asset_id: assetId,
        person_id: parseInt(selectedPersonId),
        ownership_type: 'assigned',
        description: 'Assigned via frontend'
      });
      setOpen(false);
      setSelectedPersonId('');
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
          <span>{owner.person?.first_name} {owner.person?.last_name}</span>
          <IconButton size="small" onClick={() => handleRemove(owner.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Assign Person</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Person"
            value={selectedPersonId}
            onChange={e => setSelectedPersonId(e.target.value)}
            margin="normal"
          >
            {persons.map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.first_name} {p.last_name} ({p.email})
              </MenuItem>
            ))}
          </TextField>
          <Button fullWidth variant="contained" onClick={handleAssign}>
            Assign
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OwnersTab;
