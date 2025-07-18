import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider
} from '@mui/material';
import AssetForm from './AssetForm';

const NewAssetBlock = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.(); // parent can refresh assets
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box textAlign="right" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(prev => !prev)}>
          {open ? 'Cancel' : 'Add New Asset'}
        </Button>
      </Box>

      {open && (
        <Box sx={{ mb: 2 }}>
          <AssetForm onSuccess={handleSuccess} />
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}
    </Box>
  );
};

export default NewAssetBlock;
