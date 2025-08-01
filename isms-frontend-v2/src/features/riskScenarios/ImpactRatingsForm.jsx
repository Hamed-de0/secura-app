import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, MenuItem, TextField, Button
} from '@mui/material';
import { getImpactRatings, updateRiskScenario, getImpactDomains, updateImpactRatings } from './api';


const ImpactRatingsForm = ({ scenarioId }) => {
  const [domains, setDomains] = useState([]);
  const [ratings, setRatings] = useState({}); // { domain_id: score }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainRes, ratingsRes] = await Promise.all([
          getImpactDomains(),
          getImpactRatings(scenarioId)
        ]);
          

        const domainList = domainRes || [];
        setDomains(domainList);

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

  // Handle dropdown change
  const handleChange = (domainId, score) => {
    setRatings((prev) => ({
      ...prev,
      [domainId]: score,
    }));
  };

  // Submit the updated scores
  const handleSave = async () => {
    try {
      const payload = domains.map(domain => ({
        domain_id: domain.id,
        score: ratings[domain.id] ?? 0, // default 0 if unset
        scenario_id: scenarioId,
      }));
      updateImpactRatings(payload);
      // await axios.post(`http://127.0.0.1:8001/risks/impact-ratings/batch`, payload);
      console.log('Impact ratings saved!');
    } catch (err) {
      console.error('Error saving impact ratings:', err);
    }
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Impact Ratings</Typography>
      <Grid container spacing={2}>
        {domains.map((domain) => (
          <Grid key={domain.id} item xs={6}>
            <Typography variant="subtitle2" gutterBottom>
              {domain.name}
            </Typography>
            <TextField
              select
              fullWidth
              value={ratings[domain.id] ?? ''}
              onChange={(e) => handleChange(domain.id, parseInt(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((score) => (
                <MenuItem key={score} value={score}>{score}</MenuItem>
              ))}
            </TextField>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave}>Save Impact Ratings</Button>
      </Box>
    </Box>
  );
};

export default ImpactRatingsForm;
