import React, { useState } from 'react';
import {
  TableRow, TableCell, IconButton, Menu, MenuItem
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import AddAssetGroupDialog from './AddAssetGroupDialog';
import AssignTagModal from '../assetTags/AssignTagModal';
import { deleteAssetGroup, deleteAssetCascade } from '../api';

const GroupAssetTreeRow = ({ group, depth = 0, onRefresh }) => {
  const [expandedMap, setExpandedMap] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTarget, setMenuTarget] = useState(null);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [addGroupParent, setAddGroupParent] = useState(null);
  const [assignTagOpen, setAssignTagOpen] = useState(false);

  const navigate = useNavigate();

  const toggleExpand = (type, id) => {
    const key = `${type}-${id}`;
    setExpandedMap(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openMenu = (e, target) => {
    e.preventDefault();
    setMenuAnchor(e.currentTarget);
    setMenuTarget(target);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  const handleEditGroup = (group) => {
    setAddGroupParent(null);
    setEditGroup(group);
    setAddGroupOpen(true);
  };

  const handleGroupFormSuccess = () => {
    setAddGroupOpen(false);
    onRefresh?.();
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      deleteAssetGroup(id).then(() => onRefresh?.());
    }
  };

  const handleEditAsset = (asset) => {
    navigate(`/assets/edit/${asset.id}`);
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteAssetCascade(id).then(() => onRefresh?.());
    }
  };

  const renderAssetRow = (asset, depth) => {
    const isExpanded = !!expandedMap[`asset-${asset.id}`];
    const hasChildren = (asset.children?.length || 0) > 0;

    return (
      <React.Fragment key={`asset-${asset.id}`}>
        <TableRow onContextMenu={(e) => openMenu(e, { type: 'asset', data: asset })}>
          <TableCell sx={{ pl: depth * 2 }}>
            {hasChildren ? (
              <IconButton size="small" onClick={() => toggleExpand("asset", asset.id)}>
                {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
            ) : (
              <span style={{ display: 'inline-block', width: 32 }} />
            )}
            <InsertDriveFileIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#64b5f6' }} />
            {asset.name}
          </TableCell>
          <TableCell>Asset</TableCell>
          <TableCell>{asset.description || '-'}</TableCell>
          <TableCell align="right">
            <IconButton size="small" onClick={() => handleEditAsset(asset)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteAsset(asset.id)}>
              <DeleteIcon />
            </IconButton>
            <IconButton size='small' onClick={() => navigate(`/assets/edit/${asset.id}`)}>
            <SlideshowIcon />
          </IconButton>
          </TableCell>
        </TableRow>

        {isExpanded && asset.children?.map(child => renderAssetRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const isExpanded = !!expandedMap[`group-${group.id}`];
  const hasChildren = (group.children?.length || 0) > 0 || (group.assets?.length || 0) > 0;

  return (
    <>
      <TableRow onContextMenu={(e) => openMenu(e, { type: 'group', data: group })}>
        <TableCell sx={{ pl: depth * 2 }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => toggleExpand("group", group.id)}>
              {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          ) : (
            <span style={{ display: 'inline-block', width: 32 }} />
          )}
          <FolderIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', color: '#fbc02d' }} />
          <strong>{group.name}</strong>
        </TableCell>
        <TableCell>Group</TableCell>
        <TableCell>{group.description || '-'}</TableCell>
        <TableCell align="right">
          <IconButton size="small" onClick={() => handleEditGroup(group)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteGroup(group.id)}>
            <DeleteIcon />
          </IconButton>
          
        </TableCell>
      </TableRow>

      {/* Show sub-groups first */}
      {isExpanded && group.children?.map(child => (
        <GroupAssetTreeRow
          key={`group-${child.id}`}
          group={child}
          depth={depth + 1}
          onRefresh={onRefresh}
        />
      ))}

      {/* Then show assets of this group */}
      {isExpanded && group.assets?.map(asset => renderAssetRow(asset, depth + 1))}

      {/* Right-click Menu */}
      <Menu
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {menuTarget?.type === 'group' && [
          <MenuItem key={`add-subgroup-${menuTarget.data.id}`} onClick={() => {
            setAddGroupParent(menuTarget.data);
            setAddGroupOpen(true);
            closeMenu();
          }}>
            Add Sub-Group
          </MenuItem>,
          <MenuItem key={`add-asset-${menuTarget.data.id}`} onClick={() => {
            navigate(`/assets/new?parent_id=${menuTarget.data.id}&group_id=${menuTarget.data.id}`);
            closeMenu();
          }}>
            Add Asset to Group
          </MenuItem>,
          <MenuItem key={`add-tag-to-group-${menuTarget.data.id}`} onClick={() => {          
            setAssignTagOpen(true);
            closeMenu();
          }}>
            Assign Tag
          </MenuItem>
        ]}
        {menuTarget?.type === 'asset' && (
          <MenuItem key={`add-subasset-${menuTarget.data.id}`} onClick={() => {
            navigate(`/assets/new?parent_id=${menuTarget.data.id}&group_id=${menuTarget.data.group_id}`);
            closeMenu();
          }}>
            Add Related Asset
          </MenuItem>,
          <MenuItem key={`add-tag-to-asset-${menuTarget.data.id}`} onClick={() => {          
            setAssignTagOpen(true);
            closeMenu();
          }}>
            Assign Tag
          </MenuItem>
          
          
        )}
        
          
      </Menu>
      

      {/* Add Group Dialog */}
      <AddAssetGroupDialog
        open={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        parentGroup={addGroupParent}
        onSuccess={handleGroupFormSuccess}
      />
      {/* Assign Tag Modal */}
      <AssignTagModal
        open={assignTagOpen}
        onClose={() => setAssignTagOpen(false)}
        target={menuTarget}
      />

    </>
  );
};

export default GroupAssetTreeRow;
