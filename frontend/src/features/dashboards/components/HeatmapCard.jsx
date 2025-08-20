import * as React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function HeatmapCard({ title, matrix, sx }) {
  const theme = useTheme();
  const { columns, rows, values } = matrix;

  const max = Math.max(...values.flat());
  const cellColor = (v) => {
    const t = v / (max || 1);
    const base = theme.palette.primary;
    // simple alpha ramp
    return `rgba(${hex2rgb(base.main)}, ${0.15 + t * 0.65})`;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1">{title}</Typography>
        <div style={{ overflowX:'auto', paddingTop: 8 , flexGrow: 1}}>
          <table style={{ borderCollapse:'collapse', width:'100%', minWidth: 520 }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding: 6 }}></th>
                {columns.map(c => <th key={c} style={{ textAlign:'center', padding: 6, color: theme.palette.text.secondary }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r}>
                  <td style={{ padding:6, color: theme.palette.text.secondary }}>{r}</td>
                  {columns.map((c, j) => (
                    <td key={c} style={{ padding: 4 }}>
                      <div title={`${values[i][j]}%`} style={{
                        height: 28,
                        borderRadius: 6,
                        background: cellColor(values[i][j]),
                        display:'grid', placeItems:'center',
                        color: theme.palette.getContrastText(theme.palette.background.paper),
                        fontSize: 12,
                      }}>
                        {values[i][j]}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function hex2rgb(hex) {
  const c = hex.replace('#','');
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}
