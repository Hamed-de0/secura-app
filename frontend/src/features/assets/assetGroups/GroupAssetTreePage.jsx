import React, { use, useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import GroupAssetTreeTable from './GroupAssetTreeTable';
import { getAssetGroupsTree } from '../api';
import { useNavigate } from 'react-router-dom';

const GroupAssetTreePage = () => {
  const [treeData, setTreeData] = useState([]);
  const navigate = useNavigate();
  const reloadTree = () => {
    getAssetGroupsTree().then(res => setTreeData(res.data))
        .catch(err => console.error('Failed to load tree', err));
  };
  useEffect(() => {
    reloadTree();
  }, []);

  return (
    <Box sx={{  p: 1, width: '100%'}}>
      <Typography variant="h5" gutterBottom>Asset Group Tree</Typography>
      <Button variant="contained" color="primary" onClick={() => navigate("/assets/new")} sx={{ mb: 2 }}>+ Add New Asset</Button>
      <Button variant="contained" color="primary" onClick={() => navigate("/asset-types/manage")} sx={{ mb: 2, ml: 2 }}>Asset Types</Button>
      <GroupAssetTreeTable tree={treeData} onRefresh={reloadTree} />
    </Box>
  );
};

export default GroupAssetTreePage;
