import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, IconButton, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTheme } from '@mui/material/styles';
import { getAssuranceChipProps, getSourceChipProps } from '../../../theme/chips';
import catalogMock from '../../../mock/controls_catalog.json';

export default function MappedControlsGrid({ rows = [], totalWeight = 0, onWeight, onRemove }) {
  const theme = useTheme();
  const byId = useMemo(() => new Map((catalogMock.controls||[]).map(c => [c.control_id, c])), []);

//   const columns = [
//     { field: 'code', headerName: 'Code', width: 120,
//       valueGetter: (p) => byId.get(p.row.control_id)?.code || `#${p.row.control_id}` },
//     { field: 'title', headerName: 'Control', flex: 1, minWidth: 220,
//       valueGetter: (p) => byId.get(p.row.control_id)?.title || '' },
//     { field: 'source', headerName: 'Source', width: 120,
//       renderCell: (p) => {
//         const src = byId.get(p.row.control_id)?.source; 
//         return src ? <Chip size="small" label={src} {...getSourceChipProps(src, theme)} /> : null;
//       }},
//     { field: 'assurance', headerName: 'Assurance', width: 140,
//       renderCell: (p) => {
//         const st = byId.get(p.row.control_id)?.assurance_status;
//         return st ? <Chip size="small" label={st} {...getAssuranceChipProps(st, theme)} /> : null;
//       }},
//     { field: 'weight', headerName: 'Weight', width: 130,
//       renderCell: (p) => (
//         <TextField
//           size="small"
//           type="number"
//           inputProps={{ min:0, max:1000, style:{ textAlign:'right', width: 72 } }}
//           value={p.row.weight}
//           onChange={(e)=> onWeight?.(p.row.control_id, Number(e.target.value || 0))}
//         />
//       )
//     },
//     { field: 'share', headerName: 'Share', width: 120,
//       valueGetter: (p) => {
//         const tw = totalWeight || 0; 
//         return tw ? Math.round((Number(p.row.weight||0) / tw) * 100) : 0;
//       },
//       renderCell: (p) => (
//         <Stack sx={{ width: '100%' }}>
//           <LinearProgress variant="determinate" value={p.value} sx={{ height: 6, borderRadius: 999 }} />
//           <Typography variant="caption" sx={{ textAlign:'right' }}>{p.value}%</Typography>
//         </Stack>
//       )
//     },
//     { field: 'actions', headerName: '', width: 56, sortable: false,
//       renderCell: (p) => (
//         <Tooltip title="Remove mapping">
//           <IconButton size="small" onClick={() => onRemove?.(p.row.control_id)}>
//             <DeleteOutlineIcon fontSize="small" />
//           </IconButton>
//         </Tooltip>
//       )
//     }
//   ];

// inside MappedControlsGrid.jsx

const columns = [
  {
    field: 'code',
    headerName: 'Code',
    width: 120,
    valueGetter: (params = {}) => {
      const id = params?.row?.control_id;
      const meta = byId.get(id);
      return meta?.code ?? (id != null ? `#${id}` : '');
    },
  },
  {
    field: 'title',
    headerName: 'Control',
    flex: 1,
    minWidth: 220,
    valueGetter: (params = {}) => {
      const id = params?.row?.control_id;
      return byId.get(id)?.title ?? '';
    },
  },
  {
    field: 'source',
    headerName: 'Source',
    width: 120,
    renderCell: (params = {}) => {
      const id = params?.row?.control_id;
      const src = byId.get(id)?.source;
      return src ? <Chip size="small" label={src} {...getSourceChipProps(src, theme)} /> : null;
    },
  },
  {
    field: 'assurance',
    headerName: 'Assurance',
    width: 140,
    renderCell: (params = {}) => {
      const id = params?.row?.control_id;
      const st = byId.get(id)?.assurance_status;
      return st ? <Chip size="small" label={st} {...getAssuranceChipProps(st, theme)} /> : null;
    },
  },
   { field: 'weight', headerName: 'Weight', width: 220,
   renderCell: (params = {}) => {
     const id = params?.row?.control_id;
     const w  = Number(params?.row?.weight ?? 0);
     return (
       <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
         <Box sx={{ flex: 1, px: 0.5 }}>
           <input
             type="range"
             min={0} max={1000} step={10}
             value={w}
             onChange={(e)=> onWeight?.(id, Number(e.target.value || 0))}
             style={{ width: '100%' }}
           />
         </Box>
         <TextField
           size="small"
           type="number"
           inputProps={{ min:0, max:1000, style:{ textAlign:'right', width: 72 } }}
           value={w}
           onChange={(e)=> onWeight?.(id, Number(e.target.value || 0))}
         />
       </Stack>
     );
   }
 },
  {
    field: 'share',
    headerName: 'Share',
    width: 120,
    valueGetter: (params = {}) => {
      const w = Number(params?.row?.weight) || 0;
      const tw = totalWeight || 0;
      return tw ? Math.round((w / tw) * 100) : 0;
    },
    renderCell: (params = {}) => (
      <Stack sx={{ width: '100%' }}>
        <LinearProgress variant="determinate" value={params?.value ?? 0} sx={{ height: 6, borderRadius: 999 }} />
        <Typography variant="caption" sx={{ textAlign: 'right' }}>{params?.value ?? 0}%</Typography>
      </Stack>
    ),
  },
  {
    field: 'actions',
    headerName: '',
    width: 56,
    sortable: false,
    renderCell: (params = {}) => (
      <Tooltip title="Remove mapping">
        <IconButton size="small" onClick={() => onRemove?.(params?.row?.control_id)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
  },
];

  const dgRows = rows.map((m, i) => ({ id: `${m.control_id}-${i}`, ...m }));

  return (
    <Box sx={{ width:'100%', height: 420 }}>
      <DataGrid
        rows={dgRows}
        columns={columns}
        disableColumnMenu
        pageSizeOptions={[10]}
        initialState={{ pagination:{ paginationModel:{ pageSize: 10 } } }}
      />
    </Box>
  );
}
