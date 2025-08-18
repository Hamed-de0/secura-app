import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const PersonTable = ({ persons, onEdit }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {persons.map(person => (
            <TableRow key={person.id}>
              <TableCell>{person.first_name} {person.last_name}</TableCell>
              <TableCell>{person.email}</TableCell>
              <TableCell>{person.department}</TableCell>
              <TableCell>{person.location}</TableCell>
              <TableCell>
                <IconButton onClick={() => onEdit(person)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PersonTable;
