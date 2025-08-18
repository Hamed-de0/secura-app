import React from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';

export default function MappingTotals({ totalWeight = 0, count = 0 }) {
  const warn = totalWeight <= 0 || count === 0;
  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2">Mapped controls: <b>{count}</b></Typography>
        <Typography variant="body2">Total weight: <b>{totalWeight}</b></Typography>
      </Stack>
      {warn && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Add controls and set weights &gt; 0 — total weight must be positive.
        </Alert>
      )}
    </Box>
  );
}
