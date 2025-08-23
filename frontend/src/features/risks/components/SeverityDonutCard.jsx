import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import Donut from '../charts/Donut';

export default function SeverityDonutCard({ counts, size =160, stroke=16 }) {
  const theme = useTheme();
  const segs = [
    { label: 'Low',      value: counts?.Low ?? 0,      color: theme.palette.info.main },
    { label: 'Medium',   value: counts?.Medium ?? 0,   color: theme.palette.warning.main },
    { label: 'High',     value: counts?.High ?? 0,     color: theme.palette.error.light },
    { label: 'Critical', value: counts?.Critical ?? 0, color: theme.palette.error.main },
  ];
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction="column" spacing={2} alignItems="center">
          <Donut segments={segs} size={size} stroke={stroke} />
          <Box>
            {segs.map(s=>(
              <Stack key={s.label} direction="row" spacing={1} alignItems="center" sx={{ mb: .5 }}>
                <Box sx={{ width:10, height:10, bgcolor:s.color, borderRadius:'50%' }} />
                <Typography variant="body2" sx={{ minWidth: 80 }}>{s.label}</Typography>
                <Typography variant="body2" color="text.secondary">{s.value}</Typography>
              </Stack>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
