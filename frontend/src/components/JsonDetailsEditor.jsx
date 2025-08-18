import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const JsonDetailsEditor = ({ value, onChange }) => {
  const [rows, setRows] = useState([]);

  // Load existing JSON on mount
  useEffect(() => {
    if (value && typeof value === 'object') {
      const entries = Object.entries(value).map(([key, val]) => ({ key, value: val }));
      setRows(entries.length ? entries : [{ key: '', value: '' }]);
    } else {
      setRows([{ key: '', value: '' }]);
    }
  }, [value]);

  // Push updated object to parent
  const updateParent = (updatedRows) => {
    const obj = {};
    updatedRows.forEach(({ key, value }) => {
      if (key.trim()) obj[key] = value;
    });
    onChange(obj);
  };

  const handleChange = (index, field, val) => {
    const updated = [...rows];
    updated[index][field] = val;
    setRows(updated);
    updateParent(updated);
  };

  const handleAdd = () => {
    const updated = [...rows, { key: '', value: '' }];
    setRows(updated);
  };

  const handleDelete = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    updateParent(updated);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1">Details (Key-Value Pairs)</Typography>
      {rows.map((row, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            label="Key"
            value={row.key}
            onChange={(e) => handleChange(index, 'key', e.target.value)}
            fullWidth
          />
          <TextField
            label="Value"
            value={row.value}
            onChange={(e) => handleChange(index, 'value', e.target.value)}
            fullWidth
          />
          <IconButton onClick={() => handleDelete(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}
      <Button sx={{alignContent: 'right'}} variant="outlined" startIcon={<Add />} onClick={handleAdd}>
        Add Row
      </Button>
    </Box>
  );
};

export default JsonDetailsEditor;
