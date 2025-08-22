import * as React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export default function Heatmap5x5({ matrix, onCellClick }) {
  const theme = useTheme();
  const max = Math.max(...matrix.flat(), 1);
  const start = theme.palette.mode === 'dark' ? '#26334d' : '#e3ecff';
  const end   = theme.palette.error.main;
  const mix = (a, b, t) => {
    const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
    const r = Math.round(((ah>>16)*(1-t))+((bh>>16)*t));
    const g = Math.round((((ah>>8)&255)*(1-t))+(((bh>>8)&255)*t));
    const bl= Math.round(((ah&255)*(1-t))+((bh&255)*t));
    return `#${(r<<16|g<<8|bl).toString(16).padStart(6,'0')}`;
  };
  return (
    <Box>
      <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: .6 }}>
        {matrix.map((row, rIdx) => row.map((val, cIdx) => {
          const t = Math.pow(val / max, 0.7);
          const bg = mix(start, end, t);
          const i = 5 - rIdx, l = cIdx + 1;
          return (
            <Box key={`${rIdx}-${cIdx}`} onClick={() => onCellClick?.(i,l)}
                 sx={{
                   aspectRatio:'1/1', borderRadius: 1.2, bgcolor: bg,
                   display:'flex', alignItems:'center', justifyContent:'center',
                   cursor:'pointer', userSelect:'none', color: theme.palette.getContrastText(bg),
                   '&:hover': { filter: 'brightness(1.05)' }
                 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{val}</Typography>
            </Box>
          );
        }))}
      </Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', mt: .5 }}>
        <Typography variant="caption" color="text.secondary">Likelihood →</Typography>
        <Typography variant="caption" color="text.secondary">Impact ↑</Typography>
      </Box>
    </Box>
  );
}
