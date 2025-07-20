import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import GroupAssetTreeTable from './GroupAssetTreeTable';
import { getAssetGroupsTree } from '../api';

const GroupAssetTreePage = () => {
  const [treeData, setTreeData] = useState([]);
  const reloadTree = () => {
    getAssetGroupsTree().then(res => setTreeData(res.data))
        .catch(err => console.error('Failed to load tree', err));
  };
  useEffect(() => {
    reloadTree();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Asset Group Tree</Typography>
      <GroupAssetTreeTable tree={treeData} onRefresh={reloadTree} />
    </Box>
  );
};

export default GroupAssetTreePage;
