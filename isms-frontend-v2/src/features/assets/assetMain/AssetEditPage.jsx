import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AssetTabs from '../assetTabs/AssetTabs';

const AssetEditPage = () => {
  const { id } = useParams();
  const assetId = parseInt(id);

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <AssetTabs assetId={assetId} isNew={false} />
    </Box>
  );
};

export default AssetEditPage;
