import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider
} from '@mui/material';
import AssetForm from './AssetForm';
import { useSearchParams } from 'react-router-dom';

const NewAssetBlock = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);

  const [params] = useSearchParams();
  const groupId = params.get("group_id");
  const parentId = params.get("parent_id");
  console.log('parent_id', parentId, 'group_id', groupId);
  
  
  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.(); // parent can refresh assets
  };

  useEffect(() => {
    if (groupId || parentId) {
      setOpen(true);
    }
  }, [groupId, parentId]); // ✅ only runs once when params change


  return (
    <Box sx={{ mb: 2 }}>
      <Box textAlign="right" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(prev => !prev)}>
          {open ? 'Cancel' : 'Add New Asset'}
        </Button>
      </Box>

      {open && (
        <Box sx={{ mb: 2 }}>
          <AssetForm 
            initialGroupId={groupId}
            parentAssetId={parentId}
            onSuccess={handleSuccess} 
          />
          <Divider sx={{ mt: 2 }} />
        </Box>
      )}
    </Box>
  );
};

export default NewAssetBlock;
