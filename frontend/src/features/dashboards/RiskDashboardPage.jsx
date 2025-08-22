// frontend/src/features/risk/RiskDashboardHero.jsx
import * as React from 'react';
import {
  Box, Paper, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  MenuItem, Switch, Stack, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AddTaskIcon from '@mui/icons-material/AddTask';

function Spark({ width = 120, height = 24 }) {
  // simple wave to mimic the screenshot sparkline
  const pts = Array.from({ length: 16 }, (_, i) => {
    const x = (i / 15) * (width - 2) + 1;
    const y = 1 + (height - 2) * (0.5 - 0.4 * Math.sin((i / 15) * Math.PI * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} aria-label="spark">
      <polyline points={pts} fill="none" stroke="#5b7cff" strokeWidth="2" />
    </svg>
  );
}

function KPI({ label, value, suffix, spark = true }) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">{label}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}{suffix || ''}</Typography>
        </Box>
        {spark && <Spark />}
      </CardContent>
    </Card>
  );
}

/**
 * Risk dashboard hero + filters. Width is controlled exactly via size.width (px or string).
 * Place your DataGrid (or any content) as children; it renders in a framed container below.
 */
export default function RiskDashboardHero({
  size = { width: 1440 },
  metrics = { over: 1, trendPct: 92, withOwner: 75, exceptions: 3, reviewSLA: 81 },
  filters = {},
  children,
}) {
  const widthPx = typeof size?.width === 'number' ? `${size.width}px` : size?.width || '100%';

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {/* KPIs row */}
      <Grid container spacing={2} sx={{ width: widthPx, m: 0 }}>
        <Grid item xs={12} sm={6} md={2.4}><KPI label="Over-Appetite" value={metrics.over} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPI label="Total Residual Trend" value={metrics.trendPct} suffix="%" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPI label="% with Owner" value={metrics.withOwner} suffix="%" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPI label="Exceptions expiring" value={metrics.exceptions} /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><KPI label="Last Review SLA" value={metrics.reviewSLA} suffix="%" /></Grid>
      </Grid>

      {/* Filters row (visual-only; wire to state later) */}
      <Paper elevation={0} sx={{ width: widthPx, p: 1.5, borderRadius: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Search"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
        <TextField size="small" select label="Domain" defaultValue="All" sx={{ minWidth: 140 }}>
          {['All','C','I','A','L','R'].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Scope Type" defaultValue="All" sx={{ minWidth: 160 }}>
          {['All','Asset','Asset Type','Group','Tag'].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Owner" defaultValue="All" sx={{ minWidth: 160 }}>
          {['All','Assigned','Unassigned'].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}
        </TextField>
        <TextField size="small" label="Risk Appetite" defaultValue={30} sx={{ width: 140 }} />
        <Stack direction="row" alignItems="center" sx={{ px: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Over-Appetite only</Typography>
          <Switch size="small" />
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ShowChartIcon />}>WHAT-IF</Button>
          <Button variant="contained" startIcon={<AddTaskIcon />}>CREATE PLAN</Button>
        </Stack>
      </Paper>

      {/* DataGrid frame */}
      <Paper variant="outlined" sx={{ width: widthPx, borderRadius: 3, p: 1 }}>
        {children}
      </Paper>
    </Box>
  );
}
