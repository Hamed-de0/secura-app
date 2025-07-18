import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Divider
} from '@mui/material';
import AssetForm from './AssetForm';
import AssetTable from './AssetTable';
import { fetchAssetsTree } from './api';

const AssetView = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('view'); // 'view' | 'add'

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = () => {
    fetchAssetsTree()
      .then(res => setAssets(res.data))
      .catch(err => console.error(err));
  };

  const filteredAssets = assets.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuccess = () => {
    loadAssets();
    setMode('view');
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Assets</Typography>

      {mode === 'view' && (
        <>
          {/* 🔍 Search + Add Button visible only in view mode */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search assets..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4} textAlign="right">
              <Button variant="contained" onClick={() => setMode('add')}>
                Add New Asset
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ mb: 2 }} />
          <AssetTable assets={filteredAssets} />
        </>
      )}

      {mode === 'add' && (
        <>
          {/* 📝 Form only (no search) */}
          <Box textAlign="right" sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={() => setMode('view')}>
              Cancel
            </Button>
          </Box>
          <AssetForm onSuccess={handleAddSuccess} />
        </>
      )}
    </Box>
  );
};

export default AssetView;
