import * as React from 'react';

export default function Donut({ segments, size = 160, stroke = 16 }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = (size - stroke) / 2;
  const c = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} stroke="rgba(0,0,0,0.2)" strokeWidth={stroke} fill="none" />
      {segments.map((s, i) => {
        const f0 = acc / total; acc += s.value; const f1 = acc / total;
        const a0 = f0 * 2 * Math.PI - Math.PI / 2;
        const a1 = f1 * 2 * Math.PI - Math.PI / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0);
        const x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
        return (
          <path key={i}
            d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`}
            stroke={s.color} strokeWidth={stroke} fill="none" />
        );
      })}
    </svg>
  );
}
