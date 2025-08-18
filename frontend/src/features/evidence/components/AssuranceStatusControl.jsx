import React from 'react';
import { ToggleButton, ToggleButtonGroup, Typography, Stack } from '@mui/material';

const OPTIONS = ['planning','implemented','verified','evidenced'];

export default function AssuranceStatusControl({ value, onChange }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Assurance status</Typography>
      <ToggleButtonGroup size="small" exclusive value={value || null} onChange={(_, v)=> v && onChange?.(v)}>
        {OPTIONS.map(o => <ToggleButton key={o} value={o}>{o}</ToggleButton>)}
      </ToggleButtonGroup>
    </Stack>
  );
}
