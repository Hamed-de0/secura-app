import React from 'react';
import { Box, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

const TYPES = ['assurance_change','evidence_upload','mapping_added','risk_update'];

export default function ActivityFilters({ q, setQ, types, setTypes }) {
  const handleTypes = (_, val) => setTypes(val);

  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
        <TextField size="small" placeholder="Search activity…" value={q} onChange={(e)=> setQ(e.target.value)} sx={{ minWidth: 260 }} />
        <ToggleButtonGroup size="small" value={types} onChange={handleTypes} aria-label="types" multiple>
          {TYPES.map(t => <ToggleButton key={t} value={t}>{t}</ToggleButton>)}
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
}
