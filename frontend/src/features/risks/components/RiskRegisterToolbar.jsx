import * as React from 'react';
import {
  Box, Stack, TextField, InputAdornment, IconButton, MenuItem, Button, Chip, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

const SCOPE_OPTS  = ['all','asset','asset_type','asset_group','entity','provider', 'organization'];
const STATUS_OPTS = ['all','Open','Mitigating','Closed'];
const DOMAIN_OPTS = ['all','C','I','A','L','R'];

export default function RiskRegisterToolbar({
  filters, onFiltersChange, onCreateRisk
}) {
  const f = filters;

  const set = (patch) => onFiltersChange({ ...f, ...patch });

  return (
    <Stack direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ xs:'stretch', sm:'center' }}>
      {/* Search */}
      <TextField
        size="small" placeholder="Search scenario / scope / owner"
        value={f.search || ''} onChange={(e)=>set({ search: e.target.value })}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          endAdornment: f.search ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={()=>set({ search: '' })}><ClearIcon fontSize="small" /></IconButton>
            </InputAdornment>
          ) : null
        }}
        sx={{ minWidth: 280 }}
      />

      {/* Scope, Status, Domain */}
      <TextField
        select size="small" label="Scope"
        value={f.scope} onChange={(e)=>set({ scope: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {SCOPE_OPTS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </TextField>

      <TextField
        select size="small" label="Status"
        value={f.status} onChange={(e)=>set({ status: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {STATUS_OPTS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </TextField>

      <TextField
        select size="small" label="Domain"
        value={f.domain} onChange={(e)=>set({ domain: e.target.value })}
        sx={{ minWidth: 140 }}
      >
        {DOMAIN_OPTS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
      </TextField>

      <Box flex={1} />

      {/* Quick chips */}
      <Tooltip title="Show only risks over appetite">
        <Chip
          color={f.overAppetite ? 'error' : 'default'}
          variant={f.overAppetite ? 'filled' : 'outlined'}
          onClick={()=>set({ overAppetite: !f.overAppetite })}
          label="Over-Appetite"
          size="small"
        />
      </Tooltip>

      {/* Create Risk */}
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateRisk}>
        Create Risk
      </Button>
    </Stack>
  );
}
