import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem,
  Button, Slider, Stack
} from '@mui/material';
import axios from 'axios';
import configs from '../../configs';

const classificationLevels = [
  "Public", "Internal", "Confidential", "Restricted", "Top Secret"
];

const SecurityTab = ({ assetId }) => {
  const [profile, setProfile] = useState({
    asset_id: assetId,
    confidentiality: 3,
    integrity: 3,
    availability: 3,
    classification: 'Internal',
    description: ''
  });
  const [profileId, setProfileId] = useState(null);  // profile ID in DB
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${configs.API_BASE_URL}/asset_security_profiles/`);
      const found = res.data.find(p => p.asset_id === assetId);
      if (found) {
        setProfile(found);
        setProfileId(found.id);
      }
    } catch (err) {
      console.warn('Profile not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      if (profileId) {
        await axios.put(`${configs.API_BASE_URL}/asset_security_profiles/${profileId}`, profile);
      } else {
        const res = await axios.post(`${configs.API_BASE_URL}/asset_security_profiles/`, profile);
        setProfileId(res.data.id);
      }
      console.log('Security profile saved.');
    } catch (err) {
      console.error('Failed to save profile', err);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchProfile();
  }, [assetId]);

  if (loading) return <div>Loading...</div>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>CIA Profile</Typography>

      <Stack spacing={3} sx={{ maxWidth: 400 }}>
        <Box>
          <Typography gutterBottom>Confidentiality: {profile.confidentiality}</Typography>
          <Slider
            min={1} max={5}
            value={profile.confidentiality}
            onChange={(e, val) => handleChange('confidentiality', val)}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Integrity: {profile.integrity}</Typography>
          <Slider
            min={1} max={5}
            value={profile.integrity}
            onChange={(e, val) => handleChange('integrity', val)}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Availability: {profile.availability}</Typography>
          <Slider
            min={1} max={5}
            value={profile.availability}
            onChange={(e, val) => handleChange('availability', val)}
            valueLabelDisplay="auto"
          />
        </Box>

        <TextField
          select
          fullWidth
          label="Classification"
          value={profile.classification}
          onChange={(e) => handleChange('classification', e.target.value)}
        >
          {classificationLevels.map(level => (
            <MenuItem key={level} value={level}>{level}</MenuItem>
          ))}
        </TextField>

        <TextField
          multiline
          label="Description"
          rows={3}
          value={profile.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <Button variant="contained" onClick={saveProfile}>Save Profile</Button>
      </Stack>
    </Box>
  );
};

export default SecurityTab;
