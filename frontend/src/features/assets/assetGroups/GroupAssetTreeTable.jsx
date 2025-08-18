import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Box,
  TableContainer
} from '@mui/material';
import GroupAssetTreeRow from './GroupAssetTreeRow';

const GroupAssetTreeTable = ({ tree, onRefresh }) => (
  <Box sx={{ width: '100%' }}>
    <TableContainer sx={{ width: '100%' }}>
  <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Type</TableCell>
        <TableCell>Description</TableCell>
        <TableCell align="right">Actions</TableCell> 

      </TableRow>
    </TableHead>
    <TableBody>
      {tree.map(group => (
        <GroupAssetTreeRow key={`group-${group.id}`} group={group} depth={0} onRefresh={onRefresh} />
      ))}
    </TableBody>
  </Table>
  </TableContainer>
  </Box>
);

export default GroupAssetTreeTable;
