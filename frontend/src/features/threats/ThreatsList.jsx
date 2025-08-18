import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getThreats } from './api';

export default function ThreatsList({ rows, onEdit, onAddClick }) {
  const [threats, setThreats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (rows) { setThreats(rows); return; }
    getThreats().then((data) => setThreats(data)).catch(() => setThreats([]));
  }, [rows]);

  const categories = useMemo(() => {
    if (!Array.isArray(threats)) return ['All'];
    const all = threats.map(t => t.category).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
  }, [threats]);

  useEffect(() => {
    setFiltered(category === 'All' ? threats : threats.filter(t => t.category === category));
  }, [category, threats]);

  const columns = [
    { field: 'reference_code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Threat', flex: 1, minWidth: 260 },
    { field: 'category', headerName: 'Category', width: 160 },
    { field: 'source', headerName: 'Source', width: 140 },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => onEdit?.(params.row)}>Edit</Button>
      )
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
