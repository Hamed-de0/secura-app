import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import BasicInfoTab from './BasicInfoTab';
import OwnersTab from './OwnersTab';

const AssetTabs = ({ assetId = null, isNew = false }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_, newIndex) => setTabIndex(newIndex);

  return (
    <Box>
      <Tabs value={tabIndex} onChange={handleChange} variant="scrollable">
        <Tab label="Basic Info" />
        <Tab label="Owners" disabled={isNew} />
        <Tab label="Maintenance" disabled={isNew} />
        <Tab label="Security" disabled={isNew} />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tabIndex === 0 && <BasicInfoTab assetId={assetId} />}
        {tabIndex === 1 && <OwnersTab assetId={assetId} />}
        {/* Add Maintenance and Security tabs later */}
      </Box>
    </Box>
  );
};

export default AssetTabs;
