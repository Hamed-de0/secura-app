import React from 'react';
import { useParams } from 'react-router-dom';
import AssetTabs from './AssetFormTabs/AssetTabs';
import { Box, Typography } from '@mui/material';

const AssetEditPage = () => {
  const { id } = useParams();
  const assetId = parseInt(id);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Edit Asset</Typography>
      <AssetTabs assetId={assetId} isNew={false} />
    </Box>
  );
};

export default AssetEditPage;
