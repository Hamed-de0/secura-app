import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import { getAssuranceChipProps, getSourceChipProps } from '../../../theme/chips';
import { useControlsCatalog } from '../hooks';

export default function ControlsCatalog({ mappedIds = [], onAdd }) {
  const theme = useTheme();
  const { data: all = [] } = useControlsCatalog();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter(c => {
      if (!needle) return true;
      return `${c.code} ${c.title}`.toLowerCase().includes(needle);
    }).map(c => ({ id: c.control_id, ...c }));
  }, [all, q]);

  const columns = [
    { field: 'code', headerName: 'Code', width: 110 },
    { field: 'title', headerName: 'Control', flex: 1, minWidth: 220 },
    { field: 'source', headerName: 'Source', width: 120,
      renderCell: (p) => <Chip size="small" label={p.value} {...getSourceChipProps(p.value, theme)} /> },
    { field: 'assurance_status', headerName: 'Assurance', width: 140,
      renderCell: (p) => <Chip size="small" label={p.value} {...getAssuranceChipProps(p.value, theme)} /> },
    { field: 'add', headerName: '', width: 120, sortable:false,
      renderCell: (p) => {
        const disabled = mappedIds.includes(p.row.control_id);
        return (
          <Button
            size="small"
            variant="outlined"
            disabled={disabled}
            onClick={() => onAdd?.(p.row.control_id)}
          >
            {disabled ? 'Mapped' : 'Add'}
          </Button>
        );
      }
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField size="small" placeholder="Search controls…" value={q} onChange={(e)=> setQ(e.target.value)} />
      </Stack>
      <Box sx={{ height: 420 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableColumnMenu
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Box>
  );
}
