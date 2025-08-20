import * as React from 'react';
import { Card, CardContent, Stack, Typography, LinearProgress, Box, CircularProgress } from '@mui/material';

export default function KpiTile({
  icon,
  title,
  value,
  suffix,
  hint,
  onClick,
  variant = 'linear', // 'linear' | 'radial' | 'plain'
  progress, // 0..100
  color = 'primary',
  sx: sxProp, 
}) {
  return (
    <Card
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      sx={{
        height: '100%',                  // NEW
        display: 'flex',                 // NEW
        flexDirection: 'column',         // NEW
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform .08s ease, box-shadow .2s',
        '&:hover': onClick ? { transform: 'translateY(-1px)', boxShadow: 4 } : undefined,
        borderTop: (t) => `3px solid ${t.palette[color]?.main || t.palette.primary.main}`,
        ...sxProp,                       // NEW
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ fontSize: 28, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.secondary">{title}</Typography>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h4">{value}</Typography>
              {suffix && <Typography color="text.secondary">{suffix}</Typography>}
            </Stack>
            {variant === 'linear' && typeof progress === 'number' && (
              <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
            )}
            {variant === 'radial' && typeof progress === 'number' && (
              <Box sx={{ position: 'relative', width: 64, height: 64, mt: 1 }}>
                <CircularProgress variant="determinate" value={progress} size={64} />
                <Box sx={{ position: 'absolute', inset: 0, display:'grid', placeItems:'center' }}>
                  <Typography variant="caption">{progress}%</Typography>
                </Box>
              </Box>
            )}
            {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
