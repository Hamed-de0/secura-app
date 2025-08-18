import React, { use, useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import GroupAssetTreeTable from './GroupAssetTreeTable';
import { getAssetGroupsTree } from '../api';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import AssetRightPane from '../components/AssetRightPane.jsx';
import { ScopeContext } from '../../../store/scope/ScopeProvider.jsx';

const GroupAssetTreePage = () => {
  const [treeData, setTreeData] = useState([]);
  const navigate = useNavigate();

    const { setScope } = useContext(ScopeContext);
  const [paneOpen, setPaneOpen] = useState(false);

  const openPreview = (type, id) => {
    setScope({ type, id });    // drives right-pane
    setPaneOpen(true);
  };

  const reloadTree = () => {
    getAssetGroupsTree().then(res => setTreeData(res.data))
        .catch(err => console.error('Failed to load tree', err));
  };
  useEffect(() => {
    reloadTree();
  }, []);

  // return (
  //   <Box sx={{  p: 1, width: '100%'}}>
  //     <Typography variant="h5" gutterBottom>Asset Group Tree</Typography>
  //     <Button variant="contained" color="primary" onClick={() => navigate("/assets/new")} sx={{ mb: 2 }}>+ Add New Asset</Button>
  //     <Button variant="contained" color="primary" onClick={() => navigate("/asset-types/manage")} sx={{ mb: 2, ml: 2 }}>Asset Types</Button>
  //     <GroupAssetTreeTable tree={treeData} onRefresh={reloadTree} />
  //   </Box>
  // );

    return (
  <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'stretch' }}>
    {/* LEFT: tree and actions */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="h5" gutterBottom>Asset Group Tree</Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/assets/new')}
        sx={{ mb: 2 }}
      >
        + Add New Asset
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/asset-types/manage')}
        sx={{ mb: 2, ml: 2 }}
      >
        Asset Types
      </Button>

      {/* IMPORTANT: pass onPreview down (you already wired this earlier) */}
      <GroupAssetTreeTable tree={treeData} onRefresh={reloadTree} onPreview={openPreview} />
    </Box>

    {/* RIGHT: preview pane */}
    <Box
      sx={{
        width: { xs: '100%', md: 420, lg: 520 },
        flexShrink: 0,
        borderLeft: 1,
        borderColor: 'divider',
        pl: 2,
        minHeight: '60vh',
        overflow: 'hidden',
      }}
    >
      {paneOpen
        ? <AssetRightPane />
        : (
          <EmptyState
            title="Select an asset or group"
            description="Click the eye icon in Actions to preview controls, risks, and impact."
          />
        )}
    </Box>
  </Box>
);

};

export default GroupAssetTreePage;
