import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography, LinearProgress } from '@mui/material';

export default function CoverageCard({ code, score, onClick }) {
  const pct = Math.max(0, Math.min(100, Math.round((score ?? 0) * 100)));
  return (
    <Card onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      <CardHeader
        title={code || 'Version'}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheader={`Coverage`}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography variant="h4">{pct}</Typography>
          <Typography variant="body2">%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 8, borderRadius: 999 }}
        />
      </CardContent>
    </Card>
  );
}
