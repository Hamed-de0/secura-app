import * as React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import Sparkline from '../charts/Sparkline';

export default function ResidualTrendCard({ series }) {
  const theme = useTheme();
  return (
    <Card sx={{ mt: 2, borderRadius: 3 }}>
      <CardContent>
        <Typography variant="subtitle2">Residual Risk Trend</Typography>
        <Box sx={{ mt: 1, color: theme.palette.primary.main }}>
          <Sparkline data={series} width="100%" height={80} />
        </Box>
      </CardContent>
    </Card>
  );
}
