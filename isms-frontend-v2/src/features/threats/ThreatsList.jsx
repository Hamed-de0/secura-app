import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getThreats  } from './api';

export default function ThreatsList({ onEdit, rows }) {
  const [internalThreats, setInternalThreats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');

  const isExternal = Array.isArray(rows);
    
  useEffect(() => {
    if (!isExternal) {
      getThreats()
        .then(setInternalThreats)
        .catch((err) => {
          console.error('Error loading threats:', err);
          setInternalThreats([]);
        });
    }
  }, [isExternal]);

  const threats = isExternal ? rows : internalThreats;

  // Extract unique categories
  const categories = useMemo(() => {
    if (!Array.isArray(threats)) return ['All'];
    const all = threats.map((t) => t.category).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
  }, [threats]);

  // Filter threats
  useEffect(() => {
    setFiltered(
      category === 'All'
        ? threats
        : threats.filter((t) => t.category === category)
    );
  }, [category, threats]);

  const columns = [
    { field: 'reference_code', headerName: 'Code', width: 120 },
    { field: 'name', headerName: 'Threat', flex: 1 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'source', headerName: 'Source', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => onEdit?.(params.row)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <Box sx={{  display: 'flex', flexDirection: 'column', fullWidth: true }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={category}
            label="Filter by Category"
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={() => onEdit?.(null)}>
          Add New
        </Button>
      </Box>

      <DataGrid
        autoHeight
        fullWidth
        rows={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
