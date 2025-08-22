import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';

function BarLine({ label, value, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 70 }}>{label}</Typography>
      <Box sx={{ flex: 1, height: 10, bgcolor: 'action.hover', borderRadius: 5, overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(100, value)}%`, height: '100%', bgcolor: color }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 32, textAlign:'right' }}>{value}</Typography>
    </Stack>
  );
}

export default function EvidenceFreshnessCard({ data }) {
  const theme = useTheme();
  return (
    <Card sx={{ mt: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle2">Evidence Freshness</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <BarLine label="Fresh"   value={data?.ok}      color={theme.palette.success.main} />
          <BarLine label="Due"     value={data?.warn}    color={theme.palette.warning.main} />
          <BarLine label="Overdue" value={data?.overdue} color={theme.palette.error.main} />
          <BarLine label="Missing" value={data?.missing} color={theme.palette.error.main} />
        </Stack>
      </CardContent>
    </Card>
  );
}
