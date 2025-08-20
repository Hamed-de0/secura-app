import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

export default function BarCard({ title, series, onBarClick, layout = 'horizontal', sx }) {
  const theme = useTheme();
  const isVertical = layout === 'vertical'; // Recharts nomenclature

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1">{title}</Typography>
        <div style={{ flexGrow: 1, minHeight: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} layout={layout} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              {isVertical ? (
                <>
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                </>
              )}
              <Tooltip />
              <Bar
                dataKey="percent"
                fill={theme.palette.primary.main}
                radius={[6, 6, 0, 0]}
                onClick={(d)=> onBarClick?.(d?.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
