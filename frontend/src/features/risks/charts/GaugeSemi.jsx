import * as React from 'react';

export default function GaugeSemi({c=c_, value = 0, max = 100, size = 220, track = '#ddd', bar = '#2ecc71' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const arc = (p, color, sw) => {
    const start = Math.PI, end = Math.PI * (1 - p);
    const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start);
    const x1 = cx + r * Math.cos(end),   y1 = cy + r * Math.sin(end);
    return <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${p > .5 ? 1 : 0} 1 ${x1} ${y1}`} stroke={color} strokeWidth={sw} fill="none" />;
  };
  return (
    <svg width={size} height={size/1.8}>
      {arc(1, track, 12)}
      {arc(pct, bar, 12)}
      <text x="50%" y="80%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 700, color: '#ddd' }}>
        {Math.round(value)}
      </text>
    </svg>
  );
}
