import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AssetGroupTable from './AssetGroupTable';
import AssetGroupForm from './AssetGroupForm';
import { fetchAssetGroups } from '../api';

const AssetGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadGroups = () => {
    fetchAssetGroups().then(res => setGroups(res.data));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Asset Groups</Typography>
      <Button variant="contained" onClick={() => {
        setEditing(null);
        setOpen(true);
      }}>
        Add Asset Group
      </Button>

      <AssetGroupTable groups={groups} onEdit={group => {
        setEditing(group);
        setOpen(true);
      }} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? 'Edit' : 'Add'} Asset Group</DialogTitle>
        <DialogContent>
          <AssetGroupForm
            initialData={editing}
            onSuccess={() => {
              setOpen(false);
              loadGroups();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AssetGroupPage;
