import React, { useState } from 'react';
import {
  TableRow, TableCell, IconButton
} from '@mui/material';
import {
  KeyboardArrowDown, KeyboardArrowRight
} from '@mui/icons-material';

const GroupAssetTreeRow = ({ group, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = (group.children?.length || 0) > 0 || (group.assets?.length || 0) > 0;

  return (
    <>
      <TableRow>
        <TableCell sx={{ pl: depth * 2 }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => setExpanded(prev => !prev)}>
              {expanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          ) : (
            <span style={{ display: 'inline-block', width: 32 }} />
          )}
          <strong>{group.name}</strong>
        </TableCell>
        <TableCell>Group</TableCell>
        <TableCell>{group.description || '-'}</TableCell>
      </TableRow>

      {expanded && group.assets?.map(asset => (
        <TableRow key={`asset-${asset.id}`}>
          <TableCell sx={{ pl: (depth + 1) * 2 }}>
            {asset.name}
          </TableCell>
          <TableCell>Asset</TableCell>
          <TableCell />
        </TableRow>
      ))}

      {expanded && group.children?.map(child => (
        <GroupAssetTreeRow
          key={`group-${child.id}`}
          group={child}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

export default GroupAssetTreeRow;
