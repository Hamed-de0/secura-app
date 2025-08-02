import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, MenuItem, TextField, Button
} from '@mui/material';
import { getImpactRatings, updateImpactRatings, getImpactDomains } from './api';

const ImpactRatingsForm = ({ scenarioId, onRefreshAnalysis }) => {
  const [domains, setDomains] = useState([]);
  const [ratings, setRatings] = useState({}); // { domain_id: score }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainRes, ratingsRes] = await Promise.all([
          getImpactDomains(),
          getImpactRatings(scenarioId)
        ]);

        setDomains(domainRes || []);
        const initialRatings = {};
        for (const item of ratingsRes || []) {
          initialRatings[item.domain_id] = item.score;
        }
        setRatings(initialRatings);
      } catch (err) {
        console.error('Error loading impact domains or ratings:', err);
      }
    };
    fetchData();
  }, [scenarioId]);

  const handleChange = (domainId, score) => {
    setRatings((prev) => ({
      ...prev,
      [domainId]: score,
    }));
  };

  const handleSave = async () => {
    try {
      const payload = domains.map(domain => ({
        domain_id: domain.id,
        score: ratings[domain.id] ?? 0,
        scenario_id: scenarioId,
      }));
      await updateImpactRatings(payload);
      onRefreshAnalysis?.();
      console.log('Impact ratings saved!');
    } catch (err) {
      console.error('Error saving impact ratings:', err);
    }
  };

 // ImpactRatingsForm.jsx
return (
  <>
  <Typography variant="h6" gutterBottom>📊 Impact Ratings</Typography>
  <Box>
    {domains.map((domain) => (
      <Box
        key={domain.id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          gap: 1,
        }}
      >
        <Typography sx={{ flex: 1 }}>{domain.name}</Typography>
        <TextField
          select
          size="small"
          value={ratings[domain.id] ?? ''}
          onChange={(e) => handleChange(domain.id, parseInt(e.target.value))}
          sx={{ minWidth: 80 }}
        >
          {[0, 1, 2, 3, 4, 5].map((score) => (
            <MenuItem key={score} value={score}>{score}</MenuItem>
          ))}
        </TextField>
      </Box>
    ))}
  </Box>
  <Box sx={{ textAlign: 'right', mt: 2 }}>
    <Button variant="contained" size="small" onClick={handleSave}>
      Save
    </Button>
  </Box>
</>

);


};

export default ImpactRatingsForm;
