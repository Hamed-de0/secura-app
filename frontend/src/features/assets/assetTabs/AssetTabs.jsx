import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import BasicInfoTab from './BasicInfoTab';
import OwnersTab from './OwnersTab';
import TagsTab from './TagsTab';
import SecurityTab from './SecurityTab';
import MaintenanceTab from './MaintenanceTab';
import LifecycleTab from './LifecycleTab';

const AssetTabs = ({ assetId = null, isNew = false }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_, newIndex) => setTabIndex(newIndex);

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tabIndex} onChange={handleChange} variant="scrollable">
        <Tab label="Basic Info" />
        <Tab label="Owners" disabled={isNew} />
        <Tab label="Tags" disabled={isNew} />
        <Tab label="Security" disabled={isNew} />
        <Tab label="Maintenance" disabled={isNew} />
        <Tab label="Event" disabled={isNew} />
      </Tabs>

      <Box sx={{ mt: 2 ,width: '100%' }}>
        {tabIndex === 0 && <BasicInfoTab assetId={assetId} />}
        {tabIndex === 1 && <OwnersTab assetId={assetId} />}
        {tabIndex === 2 && <TagsTab assetId={assetId} />}
        {tabIndex === 3 && <SecurityTab assetId={assetId} />}
        {tabIndex === 4 && <MaintenanceTab assetId={assetId} />}
        {tabIndex === 5 && <LifecycleTab assetId={assetId} />}
      </Box>
    </Box>
  );
};

export default AssetTabs;
