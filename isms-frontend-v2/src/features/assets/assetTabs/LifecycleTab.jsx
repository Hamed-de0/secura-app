import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button,
  Stack, Divider, IconButton
} from '@mui/material';
import axios from 'axios';
import configs from '../../configs';
import DeleteIcon from '@mui/icons-material/Delete';
import { MenuItem } from '@mui/material';

import dayjs from 'dayjs';

const LifecycleTab = ({ assetId }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    asset_id: assetId,
    event_type: '',
    timestamp: dayjs().format('YYYY-MM-DDTHH:mm'),
    description: ''
  });

  const eventTypes = [
    'Identified',
    'Procured',
    'Received',
    'Deployed',
    'In Use',
    'Maintained',
    'Relocated',
    'Assigned',
    'Returned',
    'Retired',
    'Decommissioned',
    'Disposed'
    ];

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/asset_lifecycle_events/`);
      const filtered = res.data.filter(e => e.asset_id === assetId);
      setEvents(filtered);
    } catch (err) {
      console.error('Failed to load events', err);
    }
  };

  const handleChange = (field, value) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${configs.API_BASE_URL}/asset_lifecycle_events/`, newEvent);
      setNewEvent({
        asset_id: assetId,
        event_type: '',
        timestamp: dayjs().format('YYYY-MM-DDTHH:mm'),
        description: ''
      });
      fetchEvents();
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${configs.API_BASE_URL}/asset_lifecycle_events/${id}`);
      fetchEvents();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [assetId]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Lifecycle Events</Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {events.map(event => (
          <Box key={event.id} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">{event.event_type}</Typography>
              <IconButton size="small" onClick={() => handleDelete(event.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="body2" color="textSecondary">
              Date: {dayjs(event.timestamp).format('YYYY-MM-DD HH:mm')}
            </Typography>
            <Typography mt={1}>{event.description}</Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" gutterBottom>Add New Event</Typography>
      <Stack spacing={2} maxWidth={500}>
        <TextField
            label="Event Type"
            select
            fullWidth
            value={newEvent.event_type}
            onChange={e => handleChange('event_type', e.target.value)}
            >
            {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                {type}
                </MenuItem>
            ))}
        </TextField>

        <TextField
          label="Timestamp"
          type="datetime-local"
          value={newEvent.timestamp}
          onChange={e => handleChange('timestamp', e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          multiline
          rows={3}
          value={newEvent.description}
          onChange={e => handleChange('description', e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleSubmit}>Add Event</Button>
      </Stack>
    </Box>
  );
};

export default LifecycleTab;
