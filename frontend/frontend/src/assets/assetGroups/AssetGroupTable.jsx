import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const AssetGroupTable = ({ groups, onEdit }) => (
  <Table size="small" sx={{ mt: 2 }}>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {groups.map(group => (
        <TableRow key={group.id}>
          <TableCell>{group.name}</TableCell>
          <TableCell>
            <IconButton size="small" onClick={() => onEdit(group)}>
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default AssetGroupTable;
