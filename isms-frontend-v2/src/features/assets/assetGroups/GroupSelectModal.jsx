import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const GroupSelectModal = ({ open, onClose, groups, onSelect }) => {
    const [selected, setSelected] = React.useState(null);
    

  const renderTree = (parentId) => {
    const children = groups.filter(g => g.parent_id === parentId);
    return children.map(group => (
      <TreeItem key={group.id} itemId={group.id.toString()} label={group.name}>
        {renderTree(group.id)}
      </TreeItem>
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Asset Group</DialogTitle>
      <DialogContent dividers>
        <SimpleTreeView
           
            onItemClick={(event, itemId) => {
                const selected = groups.find(g => g.id.toString() === itemId);
                setSelected(selected);
            }}
            
        >
        {renderTree(null)}
      </SimpleTreeView>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={() => {
            if (selected) onSelect?.(selected);
        }}>Select</Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupSelectModal;
