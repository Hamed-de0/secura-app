import * as React from 'react';
import { Box } from '@mui/material';

export default function Sparkline({ data, width = '100%', height = 60, strokeWidth = 2 }) {
  const ref = React.useRef(null);
  const [px, setPx] = React.useState(typeof width === 'number' ? width : 0);

  React.useEffect(() => {
    if (typeof width === 'number') return;
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setPx(el.clientWidth || 0));
    setPx(el.clientWidth || 0);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const W = typeof width === 'number' ? width : px;
  if (!data?.length) return <Box ref={ref} sx={{ width: '100%', height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 6;
  const pts = data.map((v, i) => {
    const x = pad + (i * (W - 2 * pad)) / Math.max(1, data.length - 1);
    const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min || 1));
    return `${x},${y}`;
  }).join(' ');

  return (
    <Box ref={ref} sx={{ width: typeof width === 'number' ? `${width}px` : '100%' }}>
      <svg width={W} height={height} role="img" aria-label="trend">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      </svg>
    </Box>
  );
}
