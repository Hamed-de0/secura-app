import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import GroupAssetTreeTable from './GroupAssetTreeTable';
import axios from 'axios';
import configs from '../../configs';

const GroupAssetTreePage = () => {
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    axios.get(`${configs.API_BASE_URL}/asset-groups/manage/tree`)
      .then(res => setTreeData(res.data))
      .catch(err => console.error('Failed to load tree', err));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Asset Group Tree</Typography>
      <GroupAssetTreeTable tree={treeData} />
    </Box>
  );
};

export default GroupAssetTreePage;
