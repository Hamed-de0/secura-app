import React, { useEffect, useMemo, useState } from 'react';
import { Box, Modal, Typography, Select, MenuItem, FormControl, InputLabel, Button, Chip, Stack, FormControlLabel, Switch } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getControls } from './api';

export default function ControlModal({ open, onClose, onSelect, linkedIds = new Set() }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [hideLinked, setHideLinked] = useState(true);

  useEffect(() => { if (open) getControls().then(setItems).catch(()=>setItems([])); }, [open]);

  const categories = useMemo(() => {
    if (!Array.isArray(items)) return ['All'];
    return ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];
  }, [items]);

  const filtered = useMemo(() => {
    let rows = Array.isArray(items) ? items : [];
    if (category !== 'All') rows = rows.filter(r => r.category === category);
    if (hideLinked) rows = rows.filter(r => !linkedIds.has(r.id));
    return rows;
  }, [items, category, hideLinked, linkedIds]);

  const columns = [
    { field: 'reference_code', headerName: 'Code', width: 130 },
    { field: 'title_en', headerName: 'Name', flex: 1, minWidth: 300 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'control_source', headerName: 'Source', width: 140 },
    {
      field: 'actions', headerName: 'Action', width: 140,
      renderCell: (params) => linkedIds.has(params.row.id)
        ? <Chip size="small" label="Linked" />
        : <Button size="small" variant="contained" onClick={() => onSelect(params.row)}>ADD</Button>
    }
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 3, bgcolor: 'background.paper', m: '6% auto', width: '86%', borderRadius: 2, boxShadow: 24 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Select Control</Typography>
          <FormControlLabel control={<Switch checked={hideLinked} onChange={(e)=>setHideLinked(e.target.checked)} />} label="Hide linked" />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e)=>setCategory(e.target.value)}>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <DataGrid autoHeight rows={filtered} columns={columns} getRowId={(row) => row.id} disableRowSelectionOnClick />
      </Box>
    </Modal>
  );
}
