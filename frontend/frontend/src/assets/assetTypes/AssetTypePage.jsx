import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AssetTypeTable from './AssetTypeTable';
import AssetTypeForm from './AssetTypeForm';
import { fetchAssetTypes } from '../api';

const AssetTypePage = () => {
  const [types, setTypes] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadTypes = () => {
    fetchAssetTypes().then(res => setTypes(res.data));
  };

  useEffect(() => {
    loadTypes();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Asset Types</Typography>
      <Button variant="contained" onClick={() => {
        setEditing(null);
        setOpen(true);
      }}>
        Add Asset Type
      </Button>

      <AssetTypeTable types={types} onEdit={type => {
        setEditing(type);
        setOpen(true);
      }} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? 'Edit' : 'Add'} Asset Type</DialogTitle>
        <DialogContent>
          <AssetTypeForm
            initialData={editing}
            onSuccess={() => {
              setOpen(false);
              loadTypes();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AssetTypePage;
