import * as React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

export default function DonutLegendCard({ title, data, onSliceClick }) {
  const theme = useTheme();
  const palette = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.text.disabled,
    theme.palette.primary.main,
  ];

  const total = data.reduce((a, b) => a + (b.value || 0), 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <BoxChart>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius="60%"
                  outerRadius="90%"
                  onClick={(d)=> onSliceClick?.(d?.name)}
                >
                  {data.map((entry, idx) => (
                    <Cell key={entry.name} fill={palette[idx % palette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} (${Math.round((v/total)*100)}%)`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </BoxChart>
          <Stack sx={{ minWidth: 160 }}>
            {data.map((d, i) => (
              <Typography key={d.name} variant="body2" sx={{ display:'flex', alignItems:'center', gap:1 }}>
                <span style={{ display:'inline-block', width:10, height:10, background: palette[i % palette.length], borderRadius:2 }} />
                {d.name}
                <span style={{ marginLeft: 'auto', color: theme.palette.text.secondary }}>
                  {d.value} ({total ? Math.round((d.value/total)*100) : 0}%)
                </span>
              </Typography>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function BoxChart({ children }) {
  return (
    <div style={{ width: 220, height: 160 }}>
      {children}
    </div>
  );
}
