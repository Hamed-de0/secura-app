import React from 'react';
import { Box, Chip, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';

const SOURCE_OPTIONS = ['direct', 'provider', 'baseline'];
const ASSURANCE_OPTIONS = ['planning', 'implemented', 'verified', 'evidenced'];

export default function ControlsFilters({ source, setSource, assurance, setAssurance, q, setQ, total }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <Typography variant="subtitle2">Effective controls ({total})</Typography>

        {/* Source filter */}
        <ToggleButtonGroup
          size="small" value={source} exclusive onChange={(_, v)=> setSource(v)}
          aria-label="source filter"
        >
          <ToggleButton value={null}>All sources</ToggleButton>
          {SOURCE_OPTIONS.map(opt => <ToggleButton key={opt} value={opt}>{opt}</ToggleButton>)}
        </ToggleButtonGroup>

        {/* Assurance filter */}
        <ToggleButtonGroup
          size="small" value={assurance} exclusive onChange={(_, v)=> setAssurance(v)}
          aria-label="assurance filter"
        >
          <ToggleButton value={null}>All statuses</ToggleButton>
          {ASSURANCE_OPTIONS.map(opt => <ToggleButton key={opt} value={opt}>{opt}</ToggleButton>)}
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Search code/title…"
          value={q}
          onChange={(e)=> setQ(e.target.value)}
          sx={{ minWidth: 220 }}
        />
      </Stack>
    </Box>
  );
}
