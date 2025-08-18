import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent, Chip, Stack, Typography } from '@mui/material';

export default function ProviderSummary({ controls }) {
  const { providerCount, byAssurance } = useMemo(() => {
    const list = Array.isArray(controls) ? controls : [];
    const providers = list.filter(c => c.source === 'provider');
    const counts = providers.reduce((acc, c) => {
      const k = (c.assurance_status || 'unknown').toLowerCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return { providerCount: providers.length, byAssurance: counts };
  }, [controls]);

  return (
    <Card>
      <CardHeader
        title="Provider inheritance"
        subheader={`${providerCount} effective controls from providers`}
        titleTypographyProps={{ variant: 'subtitle2' }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        {providerCount === 0 ? (
          <Typography variant="body2" color="text.secondary">No provider-sourced controls at this scope.</Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {Object.entries(byAssurance).map(([k, v]) => (
              <Chip key={k} label={`${k}: ${v}`} size="small" />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
