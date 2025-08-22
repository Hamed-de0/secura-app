import * as React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

function MiniSpark({ data = [6,7,6,8,9,8,10], width = 120, height = 36 }) {
  const max = Math.max(...data, 1), min = Math.min(...data);
  const pad = 4;
  const pts = data.map((v, i) => {
    const x = pad + (i * (width - 2 * pad)) / (data.length - 1 || 1);
    const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} aria-label="spark">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export default function MetricTile({ title, color, icon: Icon, main, sub = [], spark, accent }) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: '100%',
        background: theme => `linear-gradient(135deg, ${
          alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)
        } 0%, ${
          alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.36 : 0.22)
        } 100%)`,
        border: theme => `1px solid ${alpha(color || theme.palette.primary.main, 0.35)}`,
        boxShadow: '0 10px 24px rgba(0,0,0,.18)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ color: color, letterSpacing: 0.6 }}>
              {title}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{main}</Typography>
              {accent && (
                <Chip size="small" label={accent}
                  sx={{ bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22), color, fontWeight: 600 }} />
              )}
            </Stack>
          </Box>
          {Icon && (
            <Box sx={{
              bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22),
              color, p: 1, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon sx={{ fontSize: 28 }} />
            </Box>
          )}
        </Stack>

        {sub?.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: spark ? 1 : 0 }}>
            {sub.map((s, i) => (
              <Chip key={i} size="small" label={`${s.label}: ${s.value}`} sx={{ bgcolor: 'action.hover' }} />
            ))}
          </Stack>
        )}

        {spark && <Box sx={{ color, mt: .5 }}><MiniSpark data={spark} /></Box>}
      </CardContent>
    </Card>
  );
}
