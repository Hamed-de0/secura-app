import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function RiskMetrics({ risks = [] }) {
  const { total, byStatus, byLevel, avgResidual } = useMemo(() => {
    const list = Array.isArray(risks) ? risks : [];
    const status = {};
    const level = {};
    let sum = 0;
    for (const r of list) {
      status[r.status] = (status[r.status] || 0) + 1;
      const lv = Number(r.residual_level) || 0;
      level[lv] = (level[lv] || 0) + 1;
      sum += Number(r.residual_score) || 0;
    }
    return {
      total: list.length,
      byStatus: status,
      byLevel: level,
      avgResidual: list.length ? (sum / list.length) : 0
    };
  }, [risks]);

  const metric = (label, value, sub) => (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ lineHeight: 1.1 }}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      <Grid item xs={6} md={3}>{metric('Total risks', total)}</Grid>
      <Grid item xs={6} md={3}>{metric('Avg residual', Math.round(avgResidual))}</Grid>
      <Grid item xs={6} md={3}>{metric('High level (4–5)', (byLevel[4]||0)+(byLevel[5]||0))}</Grid>
      <Grid item xs={6} md={3}>{metric('Approved/Verified', (byStatus['Approved']||0)+(byStatus['Verified']||0))}</Grid>
    </Grid>
  );
}
