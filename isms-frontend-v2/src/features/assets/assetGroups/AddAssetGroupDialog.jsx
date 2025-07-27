import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import AssetGroupForm from './AssetGroupForm';

const AddAssetGroupDialog = ({ open, onClose, parentGroup, groupToEdit, onSuccess }) => {
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (groupToEdit) {
      setInitialData(groupToEdit);
    } else if (parentGroup) {
      setInitialData({ parent_id: parentGroup.id });
    } else {
      setInitialData(null);
    }
  }, [parentGroup, groupToEdit]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{groupToEdit ? 'Edit Asset Group' : 'Add New Asset Group'}</DialogTitle>
      <DialogContent>
        <AssetGroupForm
          initialData={initialData}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetGroupDialog;
