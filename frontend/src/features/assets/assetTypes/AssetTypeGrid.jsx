import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { getAssetTypes } from './api'; // Adjust the import path as necessary
import { DataGrid } from '@mui/x-data-grid';

export default function AssetTypeGrid({ onSelect }) {
  const [assetTypes, setAssetTypes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');

  // Fetch asset types on mount
  useEffect(() => {
    getAssetTypes()
      .then(setAssetTypes,setFiltered);
      
  }, []);

  // Extract unique category names
  const categories = useMemo(() => {
    if (!Array.isArray(assetTypes)) return ['All'];
    const all = assetTypes.map((t) => t.category).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
    }, [assetTypes]);
  // Filter asset types when category changes
  useEffect(() => {
    setFiltered(
      category === 'All'
        ? assetTypes
        : assetTypes.filter((t) => t.category === category)
    );

}, [category, assetTypes]);

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
    },
    { field: 'name', headerName: 'Asset Type', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    
  ];

  return (
    <Box>
      <FormControl size="small" sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => {
            console.log('Selected category:', e.target.value);
            setCategory(e.target.value)
          }}
          sx={{ minWidth: 200 }}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filtered && filtered.length > 0 ? (
        <DataGrid
        autoHeight
        rows={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={(params) => onSelect(params.row)}
        pageSize={10}
      />
      ) : (<p>No asset types found</p>)}
    </Box>
  );
}
