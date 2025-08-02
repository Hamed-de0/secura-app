import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Grid, Button, Chip, Divider, Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  getRiskScenarioById,
  updateRiskScenario,
} from './api';
import ImpactRatingsForm from './ImpactRatingsForm';
import ControlImpactTable from './ControlImpactTable';

const RiskScenarioEdit = () => {
  const { scenarioId } = useParams();

  const [scenario, setScenario] = useState(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_de: '',
    description_en: '',
    description_de: '',
    likelihood: '',
    status: 'Open',
  });

  useEffect(() => {
    getRiskScenarioById(scenarioId).then((data) => {
      setScenario(data);
      setFormData({
        title_en: data.title_en || '',
        title_de: data.title_de || '',
        description_en: data.description_en || '',
        description_de: data.description_de || '',
        likelihood: data.likelihood || '',
        status: data.status || 'Open',
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
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit Risk Scenario</Typography>

      {/* 🔷 Summary Section */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>📘 Scenario Summary</Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}><b>Asset:</b> {scenario.asset_name || '–'}</Grid>
          <Grid item xs={6}><b>Group:</b> {scenario.asset_group_name || '–'}</Grid>
          <Grid item xs={6}><b>Type:</b> {scenario.asset_type_name || '–'}</Grid>
          <Grid item xs={6}>
            <b>Lifecycle:</b>
            {(scenario.lifecycle_states || []).map((state, i) => (
              <Chip key={i} label={state} size="small" sx={{ mx: 0.5 }} />
            ))}
          </Grid>
          <Grid item xs={6}><b>Category:</b> {scenario.category_name_en}</Grid>
          <Grid item xs={6}><b>Subcategory:</b> {scenario.subcategory_name_en}</Grid>
          <Grid item xs={6}>
            <b>Tags:</b>
            {(scenario.tag_names || []).map((tag, i) => (
              <Chip key={i} label={tag} size="small" sx={{ mx: 0.5 }} />
            ))}
          </Grid>
          <Grid item xs={6}><b>Threat:</b> {scenario.threat_name}</Grid>
          <Grid item xs={6}><b>Vulnerability:</b> {scenario.vulnerability_name}</Grid>
        </Grid>
      </Paper>

      {/* ✏️ Editable Fields */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>📝 Scenario Details</Typography>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField label="Title (EN)" name="title_en" fullWidth value={formData.title_en} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Title (DE)" name="title_de" fullWidth value={formData.title_de} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description (EN)" name="description_en" fullWidth multiline minRows={2} value={formData.description_en} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description (DE)" name="description_de" fullWidth multiline minRows={2} value={formData.description_de} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Likelihood (1–5)"
              select fullWidth name="likelihood"
              value={formData.likelihood}
              onChange={handleChange}
            >
              {[1, 2, 3, 4, 5].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Status"
              select fullWidth name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {['Open', 'Mitigated', 'Accepted'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleSave}>💾 Save Changes</Button>
        </Box>
      </Paper>

      {/* 📊 Impact Ratings */}
      <ImpactRatingsForm scenarioId={scenarioId} />

      {/* 🔗 Control Effect Table */}
      <ControlImpactTable scenarioId={scenarioId} />
    </Box>
  );
};

export default RiskScenarioEdit;
