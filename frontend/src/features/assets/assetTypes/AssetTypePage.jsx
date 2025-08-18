// AssetTypeManager/index.jsx
import React, { useState } from 'react';
import AssetTypeGrid from './AssetTypeGrid';
import AssetTypeDetailsTabs from './AssetTypeDetailsTabs';
import { Box, Grid, Typography } from '@mui/material';

export default function AssetTypePage() {
  const [selectedAssetType, setSelectedAssetType] = useState(null);

  return (

    <Box display="flex" gap={2}>
      <Box sx={{ minWidth: 400, flexShrink: 0 }}>
        <AssetTypeGrid onSelect={setSelectedAssetType} />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        {selectedAssetType ? (
          <AssetTypeDetailsTabs assetType={selectedAssetType} />
        ) : (
          <Box p={2}>
            <Typography variant="h6">Select an Asset Type to view details</Typography>
          </Box>
        )}
      </Box>
    </Box>
    // <Box p={2}>
    //   <Grid container spacing={2}>
    //     <Grid item xs={12}>
    //       <AssetTypeGrid onSelect={setSelectedAssetType} />
    //     </Grid>
    //     {selectedAssetType && (
    //       <Grid item xs={12}>
    //         <AssetTypeDetailsTabs assetType={selectedAssetType} />
    //       </Grid>
    //     )}
    //   </Grid>
    // </Box>
  );
}
