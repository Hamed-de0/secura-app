import * as React from 'react';
import { Card, CardContent, Typography, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

export default function TrendCard({ title, series, range, onRangeChange }) {
  const theme = useTheme();

  const points = React.useMemo(() => {
    // Merge pass/fail/na by date for stacked area
    const byDate = {};
    ['pass', 'fail', 'na'].forEach(key => {
      (series[key] || []).forEach(p => {
        byDate[p.date] ||= { date: p.date };
        byDate[p.date][key] = p.value;
      });
    });
    return Object.values(byDate).sort((a,b)=> a.date.localeCompare(b.date));
  }, [series]);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">{title}</Typography>
          <ToggleButtonGroup
            size="small" exclusive value={range} onChange={(_,v)=> v && onRangeChange?.(v)}>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
            <ToggleButton value="365d">365d</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <div role="img" aria-label={`${title} stacked area trend`} style={{ width:'100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="pass" stackId="1" fill={theme.palette.success.main} stroke={theme.palette.success.main} />
              <Area type="monotone" dataKey="fail" stackId="1" fill={theme.palette.error.main} stroke={theme.palette.error.main} />
              <Area type="monotone" dataKey="na" stackId="1" fill={theme.palette.text.disabled} stroke={theme.palette.text.disabled} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
