import * as React from 'react';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import Heatmap5x5 from '../charts/Heatmap5x5';

export default function HeatmapCard({ matrix, onCell, domains = ['All','C','I','A','L','R'] }) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Risk Heatmap</Typography>
          {/* <Stack direction="row" spacing={1}>
            {domains.map(d => (
              <Chip key={d} size="small" label={d} variant={d==='All'?'filled':'outlined'} />
            ))}
          </Stack> */}
        </Stack>
        <Heatmap5x5 matrix={matrix} onCellClick={onCell} />
      </CardContent>
    </Card>
  );
}
