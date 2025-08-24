import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, Chip, Divider } from '@mui/material';

export default function StepReview({ rows, ownerId, nextReview }) {
  const created = rows.filter(r => !r.exists).length;
  const skipped = rows.filter(r => r.exists).length;
  const over = rows.filter(r => r.overAppetite).length;

  const byRag = rows.reduce((acc,r)=>{ acc[r.rag]=(acc[r.rag]||0)+1; return acc; }, {});
  const fmt = (d) => Object.entries(d).map(([k,v]) => `${k}: ${v}`).join(' • ');

  return (
    <Box sx={{ display:'grid', gap: 2 }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: .5 }}>Summary</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label={`Create: ${created}`} color="primary" />
            <Chip label={`Skip duplicates: ${skipped}`} />
            <Chip label={`Over-Appetite: ${over}`} color="warning" />
            <Chip label={fmt(byRag)} />
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" color="text.secondary">
            Owner: {ownerId ? `#${ownerId}` : 'Unassigned'} • Next review: {nextReview || '—'}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: .5 }}>Sample of candidates</Typography>
          <Stack spacing={.75}>
            {rows.slice(0, 6).map(r => (
              <Typography key={r.id} variant="body2">
                {r.scenarioTitle} — <strong>{r.scopeLabel}</strong> • Residual {r.residual} (<em>{r.rag}</em>)
              </Typography>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display:'block' }}>
            (Showing first 6 of {rows.length}.)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
