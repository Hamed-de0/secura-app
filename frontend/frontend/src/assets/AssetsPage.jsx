import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid
} from '@mui/material';

import AssetForm from './AssetForm';
import AssetTable from './AssetTable';
import axios from 'axios';
import configs from '../configs' 

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = () => {
    axios.get(`${configs.API_BASE_URL}/assets?include_children=true`)
      .then(res => setAssets(res.data))
      .catch(err => console.error(err));
  };

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ 
      padding: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // align to left
    justifyContent: 'flex-start', // align to top
     }}>
      <Typography variant="h5" gutterBottom>Assets</Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            placeholder="Search by asset name..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4} textAlign="right">
          <Button variant="contained" onClick={() => setShowForm(prev => !prev)}>
            {showForm ? 'Cancel' : 'Add New Asset'}
          </Button>
        </Grid>
      </Grid>

      {showForm && (
        <Box sx={{ mb: 4 }}>
          <AssetForm onSuccess={() => {
            fetchAssets();
            setShowForm(false);
          }} />
        </Box>
      )}

      <AssetTable assets={filteredAssets} />
    </Box>
  );
};

export default AssetsPage;
