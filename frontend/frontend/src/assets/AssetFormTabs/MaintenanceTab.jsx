import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Divider, IconButton
} from '@mui/material';
import axios from 'axios';
import configs from '../../configs';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';

const MaintenanceTab = ({ assetId }) => {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    asset_id: assetId,
    maintenance_type: '',
    performed_by: '',
    timestamp: dayjs().format('YYYY-MM-DDTHH:mm'),
    description: ''
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/asset_maintenance/`);
      const filtered = res.data.filter(r => r.asset_id === assetId);
      setRecords(filtered);
    } catch (err) {
      console.error('Failed to load maintenance records', err);
    }
  };

  const handleChange = (field, value) => {
    setNewRecord(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${configs.API_BASE_URL}/asset_maintenance/`, newRecord);
      setNewRecord({
        asset_id: assetId,
        maintenance_type: '',
        performed_by: '',
        timestamp: dayjs().format('YYYY-MM-DDTHH:mm'),
        description: ''
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to add record', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${configs.API_BASE_URL}/asset_maintenance/${id}`);
      fetchRecords();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [assetId]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Maintenance Records</Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {records.map((rec) => (
          <Box key={rec.id} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">{rec.maintenance_type}</Typography>
              <IconButton size="small" onClick={() => handleDelete(rec.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="textSecondary">
              Performed by: {rec.performed_by} on {dayjs(rec.timestamp).format('YYYY-MM-DD HH:mm')}
            </Typography>
            <Typography mt={1}>{rec.description}</Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="subtitle1" gutterBottom>Add New Maintenance</Typography>
      <Stack spacing={2} maxWidth={500}>
        <TextField
          label="Maintenance Type"
          value={newRecord.maintenance_type}
          onChange={e => handleChange('maintenance_type', e.target.value)}
          fullWidth
        />
        <TextField
          label="Performed By"
          value={newRecord.performed_by}
          onChange={e => handleChange('performed_by', e.target.value)}
          fullWidth
        />
        <TextField
          label="Timestamp"
          type="datetime-local"
          value={newRecord.timestamp}
          onChange={e => handleChange('timestamp', e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          multiline
          rows={3}
          value={newRecord.description}
          onChange={e => handleChange('description', e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit}>Add Maintenance</Button>
      </Stack>
    </Box>
  );
};

export default MaintenanceTab;
