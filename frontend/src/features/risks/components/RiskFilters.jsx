import React from 'react';
import { Box, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

const STATUS = ['Open','Analyzing','Proposed','Approved','Implementing','Verified','Accepted','Transferred'];

export default function RiskFilters({ q, setQ, status, setStatus, level, setLevel }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField size="small" placeholder="Search risks…" value={q} onChange={(e)=>setQ(e.target.value)} sx={{ minWidth: 240 }} />
        <ToggleButtonGroup size="small" value={status} exclusive onChange={(_, v)=> setStatus(v)} aria-label="status">
          <ToggleButton value={null}>All statuses</ToggleButton>
          {STATUS.map(s => <ToggleButton key={s} value={s}>{s}</ToggleButton>)}
        </ToggleButtonGroup>
        <ToggleButtonGroup size="small" value={level} exclusive onChange={(_, v)=> setLevel(v)} aria-label="residual level">
          <ToggleButton value={null}>All levels</ToggleButton>
          {[1,2,3,4,5].map(n => <ToggleButton key={n} value={n}>{n}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
}
