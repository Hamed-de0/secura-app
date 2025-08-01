import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Grid, Button, Chip, Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  getRiskScenarioById,
  updateRiskScenario,
} from './api';
import ImpactRatingsForm from './ImpactRatingsForm';

const RiskScenarioEdit = () => {
  const { scenarioId } = useParams(); // URL param like /risk-scenarios/edit/5

  const [scenario, setScenario] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_de: '',
    description_en: '',
    description_de: '',
    likelihood: '',
    status: 'Open', // optional for now
  });

  useEffect(() => {
    getRiskScenarioById(scenarioId).then((data) => {
      setScenario(data);
      console.log('Fetched scenario:', data);
      setFormData({
        title_en: data.title_en || '',
        title_de: data.title_de || '',
        description_en: data.description_en || '',
        description_de: data.description_de || '',
        likelihood: data.likelihood || '',
        status: data.status || 'Open', // or use default
      });
    });
  }, [scenarioId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      await updateRiskScenario(scenarioId, formData);
      console.log('Risk scenario updated successfully!');
    } catch (err) {
      console.error(err);

    }
  };

  if (!scenario) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Edit Risk Scenario</Typography>
        <style>{`
        .MuiGrid-container {
            display: flex !important;
            flex-direction: column !important;
        }
    `}</style>
      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f8f8', borderRadius: 1 }}>
  <Divider sx={{ mb: 2 }}>Scope</Divider>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Asset: </Typography>
    <Typography component="span">{scenario.asset_name || '–'}</Typography>
  </Box>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Asset Group: </Typography>
    <Typography component="span">{scenario.asset_group_name || '–'}</Typography>
  </Box>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Asset Type: </Typography>
    <Typography component="span">{scenario.asset_type_name || '–'}</Typography>
  </Box>
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" component="span">Lifecycle: </Typography>
    {(scenario.lifecycle_states || []).map((state, i) => (
      <Chip key={i} label={state} sx={{ mr: 1 }} size="small" />
    ))}
  </Box>

  <Divider sx={{ my: 2 }}>Classification</Divider>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Category / Subcategory: </Typography>
    <Typography component="span">{scenario.category_name_en} / {scenario.subcategory_name_en}</Typography>
  </Box>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Tags: </Typography>
    {(scenario.tag_names || []).map((tag, i) => (
      <Chip key={i} label={tag} sx={{ mr: 1 }} size="small" />
    ))}
  </Box>
  <Box sx={{ mb: 1 }}>
    <Typography variant="subtitle2" component="span">Threat: </Typography>
    <Typography component="span">{scenario.threat_name}</Typography>
  </Box>
  <Box>
    <Typography variant="subtitle2" component="span">Vulnerability: </Typography>
    <Typography component="span">{scenario.vulnerability_name}</Typography>
  </Box>
</Box>


      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Title (EN)</Typography>
          <TextField fullWidth name="title_en" value={formData.title_en} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Title (DE)</Typography>
          <TextField fullWidth name="title_de" value={formData.title_de} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Description (EN)</Typography>
          <TextField fullWidth multiline minRows={2} name="description_en" value={formData.description_en} onChange={handleChange} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2">Description (DE)</Typography>
          <TextField fullWidth multiline minRows={2} name="description_de" value={formData.description_de} onChange={handleChange} />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Likelihood (1–5)</Typography>
          <TextField
            select fullWidth name="likelihood"
            value={formData.likelihood} onChange={handleChange}
          >
            {[1, 2, 3, 4, 5].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Status</Typography>
          <TextField
            select fullWidth name="status"
            value={formData.status} onChange={handleChange}
          >
            {['Open', 'Mitigated', 'Accepted'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={handleSave}>Save Changes</Button>
      </Box>

            <ImpactRatingsForm scenarioId={scenarioId} />

    </Box>
  );
};

export default RiskScenarioEdit;
