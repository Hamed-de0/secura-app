import * as React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

export default function BarCard({ title, series, onBarClick }) {
  const theme = useTheme();
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1">{title}</Typography>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="percent" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} onClick={(d)=> onBarClick?.(d?.name)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
