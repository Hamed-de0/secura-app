// RiskScenarioControlsTab.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getAllControls,
  getControlLinksByScenario,
  createOrUpdateControlLink,
  deleteControlLink,
} from './api';

const statusOptions = ['Planned', 'In Place', 'Ineffective'];

const RiskScenarioControlsTab = ({ scenarioId }) => {
  const [controls, setControls] = useState([]);
  const [links, setLinks] = useState([]);
  const [newControlId, setNewControlId] = useState('');

  useEffect(() => {
    getAllControls().then(setControls);
    getControlLinksByScenario(scenarioId).then(setLinks);
  }, [scenarioId]);

  const handleChange = (linkId, field, value) => {
    setLinks(prev =>
      prev.map(link =>
        link.id === linkId ? { ...link, [field]: value } : link
      )
    );
  };

  const handleSave = (link) => {
    createOrUpdateControlLink({ ...link, risk_scenario_id: scenarioId })
      .then(() => alert('Saved!'))
      .catch(err => console.error('Error saving control link', err));
  };

  const handleDelete = (linkId) => {
    deleteControlLink(linkId).then(() => {
      setLinks(prev => prev.filter(l => l.id !== linkId));
    });
  };

  const handleAddControl = () => {
    if (!newControlId) return;
    const existing = links.find(l => l.control_id === parseInt(newControlId));
    if (existing) return alert('Control already linked.');
    const newLink = {
      control_id: parseInt(newControlId),
      risk_scenario_id: scenarioId,
      status: 'Planned',
      justification: '',
      residual_score: 3,
    };
    createOrUpdateControlLink(newLink).then(res => {
      setLinks(prev => [...prev, res.data]);
      setNewControlId('');
    });
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Control Impact on Risk</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={8}>
          <TextField
            select fullWidth size="small"
            label="Add Control"
            value={newControlId}
            onChange={e => setNewControlId(e.target.value)}
          >
            {controls.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.category ? `[${c.category}] ` : ''}{c.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" onClick={handleAddControl}>Add</Button>
        </Grid>
      </Grid>

      {links.map((link) => {
        const control = controls.find(c => c.id === link.control_id);
        return (
          <Box key={link.id || `${link.control_id}-temp`} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
            <Typography variant="subtitle1">{control?.title_en || 'Unknown Control'}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {control?.category ? `Category: ${control.category}` : ''}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  select fullWidth size="small"
                  label="Status"
                  value={link.status}
                  onChange={e => handleChange(link.id, 'status', e.target.value)}
                >
                  {statusOptions.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth size="small"
                  label="Residual Score"
                  type="number"
                  inputProps={{ min: 0, max: 5 }}
                  value={link.residual_score || ''}
                  onChange={e => handleChange(link.id, 'residual_score', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={4}>
                <IconButton onClick={() => handleDelete(link.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline minRows={2}
                  label="Justification"
                  value={link.justification || ''}
                  onChange={e => handleChange(link.id, 'justification', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={() => handleSave(link)}>Save Changes</Button>
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default RiskScenarioControlsTab;
