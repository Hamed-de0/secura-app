import React from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import GroupAssetTreeRow from './GroupAssetTreeRow';

const GroupAssetTreeTable = ({ tree, onRefresh }) => (
  <Table size="small">
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
);

export default GroupAssetTreeTable;
