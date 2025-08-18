import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function RiskAppetiteStrip({ risks = [], targetLevel = 2 }) {
  const { above, below, topOwner, topOwnerCount } = useMemo(() => {
    const list = Array.isArray(risks) ? risks : [];
    let above = 0, below = 0;
    const ownerCountsAbove = new Map();

    for (const r of list) {
      const lvl = Number(r.residual_level) || 0;
      const isAbove = lvl > Number(targetLevel);
      if (isAbove) {
        above += 1;
        ownerCountsAbove.set(r.owner, (ownerCountsAbove.get(r.owner) || 0) + 1);
      } else {
        below += 1;
      }
    }

    let topOwner = '—', topOwnerCount = 0;
    for (const [owner, count] of ownerCountsAbove.entries()) {
      if (count > topOwnerCount) { topOwner = owner; topOwnerCount = count; }
    }

    return { above, below, topOwner, topOwnerCount };
  }, [risks, targetLevel]);

  const Tile = ({ label, value, sub }) => (
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
      <Grid item xs={12} md={4}>
        <Tile label="Above appetite" value={above} sub={`> target level (${targetLevel})`} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Tile label="At / below appetite" value={below} sub={`≤ target level (${targetLevel})`} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Tile label="Top owner" value={topOwner} sub={topOwnerCount ? `${topOwnerCount} above appetite` : '—'} />
      </Grid>
    </Grid>
  );
}
