import React, { useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Box, Typography
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

const AssetRow = ({ asset, depth, expanded, toggleExpand }) => {
  const hasChildren = asset.children && asset.children.length > 0;
  const isExpanded = expanded[asset.id] || false;

  return (
    <>
      <TableRow>
        <TableCell sx={{ pl: depth * 2 }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => toggleExpand(asset.id)}>
              {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          ) : (
            <IconButton size="small" disabled sx={{ visibility: 'hidden' }}>
              <KeyboardArrowRight />
            </IconButton>
          )}
          {asset.name}
        </TableCell>
        <TableCell>{asset.type_id || '-'}</TableCell>
        <TableCell>{asset.group_id || '-'}</TableCell>
        <TableCell>{asset.description || '-'}</TableCell>
      </TableRow>
      {hasChildren && isExpanded && asset.children.map(child => (
        <AssetRow
          key={child.id}
          asset={child}
          depth={depth + 1}
          expanded={expanded}
          toggleExpand={toggleExpand}
        />
      ))}
    </>
  );
};


const AssetTable = ({ assets }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {assets.length === 0 ? (
        <Typography variant="body1">No assets found.</Typography>
      ) : (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assets.map(asset => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  depth={0}
                  expanded={expanded}
                  toggleExpand={toggleExpand}
                />
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
};

export default AssetTable;
