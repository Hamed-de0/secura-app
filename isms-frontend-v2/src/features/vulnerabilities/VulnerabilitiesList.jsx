import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getVulnerabilities,  } from './api'; // Make sure this is implemented

export default function VulnerabilitiesList({ onEdit, rows, onAddClick }) {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');

  // If rows are passed as prop (e.g., filtered for AssetType), use them
  useEffect(() => {
    if (rows) {
      setVulnerabilities(rows);
      return;
    }

    getVulnerabilities().then((res) => {
        console.log('Fetched vulnerabilities:', res.data);
      setVulnerabilities(res.data);
    });
  }, [rows]);

  const categories = useMemo(() => {
    if (!Array.isArray(vulnerabilities)) return ['All'];
    const all = vulnerabilities.map((v) => v.category).filter(Boolean);
    return ['All', ...Array.from(new Set(all))];
  }, [vulnerabilities]);

  useEffect(() => {
    setFiltered(
      category === 'All'
        ? vulnerabilities
        : vulnerabilities.filter((v) => v.category === category)
    );
  }, [category, vulnerabilities]);

  const columns = [
    { field: 'reference_code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Vulnerability', flex: 1 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'source', headerName: 'Source', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => onEdit?.(params.row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', flexGrow: 1 }}>
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

        <Button variant="contained" onClick={() => onAddClick(true)}>
          Add New
        </Button>
      </Box>

      <DataGrid
        rows={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        autoHeight={false}
        sx={{ width: '100%' }}
      />

      {/* <VulnerabilityModal
        open={vulnModalOpen}
        onClose={() => setVulnModalOpen(false)}
        onSelect={(vuln) => {
            console.log('Selected Vulnerability:', vuln);
            // POST to asset_type_vulnerability_link

            const payload = {
              asset_type_id: 0, // Assuming rows contain asset type info
              vulnerability_id: 0,
            };  
            // setVulnModalOpen(false);
            // addVulnLink(assetTypeId, vuln.id).then(() => {
            // refresh(); // your custom logic to reload the list
            // setVulnModalOpen(false);
            // });
        }}
        /> */}
    </Box>

    
  );
}
