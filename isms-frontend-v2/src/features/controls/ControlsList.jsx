import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getControls } from './api';

export default function ControlsList({ rows, onEdit, onAddClick }) {
  const [controls, setControls] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (rows) { setControls(rows); return; }
    getControls().then(setControls).catch(() => setControls([]));
  }, [rows]);

  const categories = useMemo(() => {
    if (!Array.isArray(controls)) return ['All'];
    return ['All', ...Array.from(new Set(controls.map(c => c.category).filter(Boolean)))];
  }, [controls]);

  useEffect(() => {
    setFiltered(category === 'All' ? controls : controls.filter(c => c.category === category));
  }, [category, controls]);

  const columns = [
    { field: 'reference_code', headerName: 'Code', width: 130 },
    { field: 'title_en', headerName: 'Control', flex: 1, minWidth: 260 },
    { field: 'category', headerName: 'Category', width: 160 },
    { field: 'control_source', headerName: 'Source', width: 140 },
    {
      field: 'actions', headerName: '...', width: 40, sortable: false,
      renderCell: (params) => <Button size="small" onClick={() => onEdit?.(params.row)}>...</Button>
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select value={category} label="Filter by Category" onChange={(e) => setCategory(e.target.value)}>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={() => onAddClick?.()}>Add New</Button>
      </Box>
      <DataGrid rows={filtered} columns={columns} getRowId={(row) => row.id} disableRowSelectionOnClick />
    </Box>
  );
}
