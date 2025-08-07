import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Grid, Button, Chip, Divider, Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  getRiskScenarioById,
  updateRiskScenario,
  getRiskAnalysis
} from './api';
import ImpactRatingsForm from './ImpactRatingsForm';
import ControlImpactTable from './ControlImpactTable';
import RiskScoreBarChart from './RiskScoreBarChart';
import {IMPACT_DOMAINS} from '../../app/constants'

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

  const [riskAnalysis, setRiskAnalysis] = useState({});

  useEffect(() => {
    getRiskScenarioById(scenarioId).then((data) => {
      setScenario(data);
      setFormData({
        title_en: data.title_en || '',
        title_de: data.title_de || '',
        description_en: data.description_en || '',
        description_de: data.description_de || '',
        status: data.status || 'Open',
      });
    });
    console.log('Fetching risk analysis for scenario:', scenarioId);
    getRiskAnalysis(scenarioId).then(setRiskAnalysis);
  }, [scenarioId]);

  useEffect(() => {
      console.log('Risk Analysis:', riskAnalysis);

  }, [riskAnalysis, scenarioId]);

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

  const InfoRow = ({ label, value }) => (
    <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" component="span">{label}: </Typography>
        <Typography component="span">{value || '–'}</Typography>
    </Box>
    );

  if (!scenario) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit Risk Scenario</Typography>

        <Box sx={{ mb: 3, p: 3, backgroundColor: '#f9f9f9', borderRadius: 2, border: '1px solid #ddd' }}>
  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <span role="img" aria-label="icon">📄</span> Scenario Summary
  </Typography>

  <Grid container spacing={2}>
    {/* LEFT COLUMN: Category, Title, Description */}
    <Grid item xs={12} md={6}>
      <InfoRow label="Category" value={scenario.category_name_en} />
      <InfoRow label="Subcategory" value={scenario.subcategory_name_en} />
      <InfoRow label="Title (EN)" value={scenario.title_en} />
      <InfoRow label="Description (EN)" value={scenario.description_en} />
    </Grid>

    {/* RIGHT COLUMN: Scope + Risk */}
    <Grid item xs={12} md={6}>
        <InfoRow label="Status" value={scenario.status} />
      {scenario.asset_name && <InfoRow label="Asset" value={scenario.asset_name} />}
      {scenario.asset_group_name && <InfoRow label="Asset Group" value={scenario.asset_group_name} />}
      {scenario.asset_type_name && <InfoRow label="Asset Type" value={scenario.asset_type_name} />}
        {scenario.threat_name && <InfoRow label="Threat" value={scenario.threat_name} />}
      {scenario.vulnerability_name && <InfoRow label="Vulnerability" value={scenario.vulnerability_name} />}
      <InfoRow
        label="Lifecycle"
        value={(scenario.lifecycle_states || []).map((s, i) => (
          <Chip key={i} label={s} size="small" sx={{ mr: 0.5 }} />
        ))}
      />

      
      {scenario.tag_names?.length > 0 && (
        <InfoRow
          label="Tags"
          value={scenario.tag_names.map((tag, i) => (
            <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />
          ))}
        />
      )}

      
    </Grid>
  </Grid>
        </Box>

        <Box
            sx={{
                display: 'flex',
                gap: 2,
                borderRadius: 2,
                border: '1px solid #ddd',
                backgroundColor: '#f9f9f9',
                p: 2,
            }}
            >
            {/* Left: Impact Ratings */}
            <Box
                sx={{
                width: '33%',
                backgroundColor: '#eee',
                border: '1px solid #ddd',
                p: 2,
                borderRadius: 2,
                }}
            >
                {/* <ImpactRatingsForm scenarioId={scenarioId}
                  onRefreshAnalysis={() => getRiskAnalysis(scenarioId).then(setRiskAnalysis)} /> */}
            </Box>

            {/* Middle: Risk Details */}
            <Box
                sx={{
                width: '33%',
                borderRadius: 2,
                border: '1px solid #ddd',
                backgroundColor: '#eee',
                p: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>Risk Details</Typography>
                <InfoRow label="Likelihood" value={scenario.likelihood || '–'} />
                <InfoRow label="Status" value={scenario.status || '–'} />
                <InfoRow label="Initial Score" value={<Typography color="error">{ riskAnalysis?.initial_score }</Typography>} />
                <InfoRow label="Residual Score" value={<Typography color="warning.main">{ riskAnalysis?.residual_score }</Typography>} />
            </Box>
            {/* Right: Risk Analysis */}
            <Box
                sx={{
                width: '33%',
                backgroundColor: '#eee',
                border: '1px solid #ddd',
                p: 2,
                borderRadius: 2,
                }}>
                    <RiskScoreBarChart
                        initialByDomain={riskAnalysis.initial_by_domain}
                        residualByDomain={riskAnalysis.residual_by_domain}
                    />
                </Box>
        </Box>



      {/* 🔗 Control Effect Table */}
      <ControlImpactTable 
        scenarioId={scenarioId} 
        onRefreshAnalysis={() => getRiskAnalysis(scenarioId).then(setRiskAnalysis)}
        />
    </Box>
  );
};

export default RiskScenarioEdit;
