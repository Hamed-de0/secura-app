import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const AssetTypeTable = ({ types, onEdit }) => (
  <Table size="small" sx={{ mt: 2 }}>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {types.map(type => (
        <TableRow key={type.id}>
          <TableCell>{type.name}</TableCell>
          <TableCell>
            <IconButton size="small" onClick={() => onEdit(type)}>
              <EditIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default AssetTypeTable;
