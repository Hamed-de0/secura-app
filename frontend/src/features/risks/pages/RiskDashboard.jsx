import * as React from 'react';
import {
  Box, Grid, Card, CardContent, Paper, Typography, Stack, Chip, useTheme, Divider
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
// ---- Icons ---------------------------------
import { alpha } from '@mui/material/styles';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';              // Risk Exposure
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'; // Appetite Breaches
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'; // Ownership & Action
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';   // Assurance Health
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';   // Improvement Trend

/* ================================
   Tiny SVG widgets (no extra libs)
   ================================ */
function Sparkline({ data, width = 220, height = 106, strokeWidth = 2 }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 6;
  const pts = data.map((v, i) => {
    const x = pad + (i * (width - 2 * pad)) / Math.max(1, data.length - 1);
    const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min || 1));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} role="img" aria-label="trend">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}

function Donut({ segments, size = 160, stroke = 16 }) {
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

function GaugeSemi({ value = 0, max = 100, size = 220, track = '#ddd', bar = '#2ecc71' }) {
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
      <text x="50%" y="80%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 700 }}>
        {Math.round(value)}
      </text>
    </svg>
  );
}

function Heatmap5x5({ matrix, onCellClick }) {
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
      <Stack direction="row" justifyContent="space-between" sx={{ mt: .5 }}>
        <Typography variant="caption" color="text.secondary">Likelihood →</Typography>
        <Typography variant="caption" color="text.secondary">Impact ↑</Typography>
      </Stack>
    </Box>
  );
}

/* ================================
   Static mock data (tune later)
   ================================ */
const MOCK = {
  totals: { scenarios: 226, contexts: 157, scopes: 38, assets: 24 },
  severity: { Low: 150, Medium: 0, High: 7, Critical: 0 },
  evidence: { ok: 86, warn: 12, overdue: 6 },
  review:   { onTrack: 19, dueSoon: 3, overdue: 2, scorePct: 76 },
  heatmap: [
    [3, 6, 8, 12, 19], // impact=5 row (left→right likelihood 1..5)
    [2, 4, 6, 9, 13],
    [1, 2, 4, 4, 16],
    [0, 1, 2, 3, 6],
    [0, 1, 2, 3, 4],
  ],
  trend: [42, 44, 46, 45, 47, 49, 48, 50, 51, 49, 52, 54],
  rows: [
    { id: 1, scenario: 'System failure due to configuration change issues', scope: 'Asset', L: 2, I: 4, initial: 60, residual: 20, owner: 'Unassigned', status: 'Open', updated: 'today' },
    { id: 2, scenario: 'Remote espionage exploiting password tables',     scope: 'Asset Type', L: 1, I: 5, initial: 50, residual: 25, owner: 'Security',   status: 'Open', updated: '2 days' },
    { id: 3, scenario: 'Drive-by exploits via third-party widgets',        scope: 'Group', L: 3, I: 3, initial: 45, residual: 18, owner: 'AppSec',     status: 'Mitigating', updated: '5 days' },
    { id: 4, scenario: 'Insider data exfiltration',                         scope: 'Asset', L: 2, I: 5, initial: 70, residual: 30, owner: 'CISO',      status: 'Open', updated: '8 days' },
  ],
};


/* ================================
   KPI card
   ================================ */
  function MiniSpark({ data = [6,7,6,8,9,8,10], width = 120, height = 36 }) {
    const max = Math.max(...data, 1), min = Math.min(...data);
    const pad = 4;
    const pts = data.map((v, i) => {
      const x = pad + (i * (width - 2 * pad)) / (data.length - 1 || 1);
      const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min));
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width={width} height={height} aria-label="spark">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }

  function MetricTile({ title, color, icon: Icon, main, sub = [], spark, accent }) {
    // sub: [{ label: 'High/Critical', value: '7' }, ...]
    return (
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
          background: theme => `linear-gradient(135deg, ${
            alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.12)
          } 0%, ${
            alpha(color || theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.36 : 0.22)
          } 100%)`,
          border: theme => `1px solid ${alpha(color || theme.palette.primary.main, 0.35)}`,
          boxShadow: '0 10px 24px rgba(0,0,0,.18)',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="overline" sx={{ color: color, letterSpacing: 0.6 }}>
                {title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>{main}</Typography>
                {accent && (
                  <Chip
                    size="small"
                    label={accent}
                    sx={{
                      bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22),
                      color,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Stack>
            </Box>
            {Icon && (
              <Box sx={{
                bgcolor: theme => alpha(color || theme.palette.primary.main, 0.22),
                color,
                p: 1,
                borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon sx={{ fontSize: 28 }} />
              </Box>
            )}
          </Stack>

          {sub?.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: spark ? 1 : 0 }}>
              {sub.map((s, i) => (
                <Chip key={i} size="small" label={`${s.label}: ${s.value}`}
                      sx={{ bgcolor: 'action.hover' }} />
              ))}
            </Stack>
          )}

          {spark && (
            <Box sx={{ color, mt: .5 }}>
              <MiniSpark data={spark} />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }



/* ================================
   Main page (static showcase)
   ================================ */
export default function RiskDashboard({ size = { width: '100%' } }) {
  const theme = useTheme();
  const widthPx = typeof size?.width === 'number' ? `${size.width}px` : size?.width || '100%';

  const donutSegs = React.useMemo(() => ([
    { label: 'Low',      value: MOCK.severity.Low,      color: theme.palette.info.main },
    { label: 'Medium',   value: MOCK.severity.Medium,   color: theme.palette.warning.main },
    { label: 'High',     value: MOCK.severity.High,     color: theme.palette.error.light },
    { label: 'Critical', value: MOCK.severity.Critical, color: theme.palette.error.main },
  ]), [theme.palette]);

  const columns = React.useMemo(() => ([
    { field: 'scenario', headerName: 'Scenario', flex: 1.4, minWidth: 240 },
    { field: 'scope',    headerName: 'Scope', width: 120 },
    { field: 'L',        headerName: 'L', width: 60, align:'center', headerAlign:'center' },
    { field: 'I',        headerName: 'I', width: 60, align:'center', headerAlign:'center' },
    { field: 'initial',  headerName: 'Initial', width: 90, align:'center', headerAlign:'center' },
    { field: 'residual', headerName: 'Residual', width: 100, align:'center', headerAlign:'center',
      renderCell:(p)=>(
        <Chip size="small" label={p.value}
          sx={{ color: theme.palette.getContrastText(theme.palette.primary.light), bgcolor: theme.palette.primary.light }} />
      )},
    { field: 'owner',    headerName: 'Owner', width: 140 },
    { field: 'status',   headerName: 'Status', width: 120 },
    { field: 'updated',  headerName: 'Updated', width: 120 },
  ]), [theme.palette]);

  return (
    <Box sx={{ display:'flex', justifyContent:'left', p: 1}} size={12}>
      <Box sx={{ width: widthPx, display:'grid', gap: 3, }} size={12}>
        
        {/* KPIs */}
        <Box
          sx={{
            p: 1,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
            //backgroundColor: 'lightblue'
          }}
        >
          {/* 1) Risk Exposure */}
          <MetricTile
            title="Risk Exposure"
            color={theme.palette.primary.main}
            icon={ShieldOutlinedIcon}
            main="157"
            sub={[
              { label: 'High/Critical', value: '7' },
              { label: 'Avg Residual', value: '23' },
            ]}
            //spark={[42, 44, 43, 47, 49, 48, 50, 51]}
          />

          {/* 2) Appetite Breaches */}
          <MetricTile
            title="Appetite Breaches"
            color={theme.palette.error.main}
            icon={ReportProblemOutlinedIcon}
            main="32"
            accent="20% of total"
            sub={[
              { label: 'Exceptions (30d)', value: '3' },
            ]}
          />

          {/* 3) Ownership & Action */}
          <MetricTile
            title="Ownership & Action"
            color={theme.palette.info.main}
            icon={PersonOutlineOutlinedIcon}
            main="75%"
            sub={[
              { label: 'With Owner', value: '75%' },
              { label: 'Mitigations', value: '12' },
            ]}
          />

          {/* 4) Assurance Health */}
          <MetricTile
            title="Assurance Health"
            color={theme.palette.success.main}
            icon={VerifiedUserOutlinedIcon}
            main="81%"
            sub={[
              { label: 'Evidence Fresh', value: '81%' },
              { label: 'Review SLA', value: '76%' },
            ]}
          />

          {/* 5) Improvement Trend */}
          <MetricTile
            title="Improvement Trend"
            color={theme.palette.warning.main}
            icon={TrendingDownOutlinedIcon}
            main="−18"
            accent="30 days"
            //spark={[54, 53, 52, 50, 49, 47, 46, 45]}
            sub={[
              { label: 'Residual Δ', value: '−18' },
            ]}
          />
        </Box>
        
        {/* Heatmap and Donuts */}
        <Box sx={{display: 'grid', gap: 2, p:1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' } , }} >
          {/* Heatmap + Domain chips */}
          <Grid item xs={12} md={7}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Risk Heatmap</Typography>
                  <Stack direction="row" spacing={1}>
                    {['All','C','I','A','L','R'].map(d=>(
                      <Chip key={d} size="small" label={d} variant={d==='All'?'filled':'outlined'} />
                    ))}
                  </Stack>
                </Stack>
                <Heatmap5x5 matrix={MOCK.heatmap} onCellClick={(i,l)=>{ /* no-op for static */ }} />
                {/* <Box sx={{ mt: 2, color: theme.palette.info.main }}>
                  <Sparkline data={MOCK.trend} />
                </Box> */}
              </CardContent>
            </Card>
          </Grid>

          {/* Donut + legend */}
          <Grid item xs={12} md={5} sx={{}} >
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Donut segments={donutSegs} />
                  <Box>
                    {donutSegs.map(s=>(
                      <Stack key={s.label} direction="row" spacing={1} alignItems="center" sx={{ mb: .5 }}>
                        <Box sx={{ width:10, height:10, bgcolor:s.color, borderRadius:'50%' }} />
                        <Typography variant="body2" sx={{ minWidth: 80 }}>{s.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.value}</Typography>
                      </Stack>
                    ))}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 1, borderRadius: 3 }} >
              <CardContent>
                <Typography variant="subtitle2">Residual Risk Trend</Typography>
                <Box sx={{ mt: 1, color: theme.palette.primary.main }}>
                  <Sparkline data={MOCK.trend} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Evidence + SLA */}
          <Grid item xs={12} md={5} sx={{}}>
            <Card sx={{ borderRadius: 2,  }}>
              <CardContent>
                <Typography variant="subtitle2">Review SLA</Typography>
                <GaugeSemi value={MOCK.review.scorePct} max={100} bar={theme.palette.success.main}
                           track={theme.palette.mode==='dark'?'#23324d':'#e4e9f4'} />
                <Stack direction="row" justifyContent="space-around" sx={{ mt: -1 }}>
                  <LegendDot color={theme.palette.success.main} label="On Track" val={MOCK.review.onTrack} />
                  <LegendDot color={theme.palette.warning.main} label="Due"      val={MOCK.review.dueSoon} />
                  <LegendDot color={theme.palette.error.main}   label="Overdue"  val={MOCK.review.overdue} />
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 1, borderRadius: 2, height: 180 }}>
              <CardContent>
                <Typography variant="subtitle2">Evidence Freshness</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <BarLine label="Fresh"   value={MOCK.evidence.ok}      color={theme.palette.success.main} />
                  <BarLine label="Due"     value={MOCK.evidence.warn}    color={theme.palette.warning.main} />
                  <BarLine label="Overdue" value={MOCK.evidence.overdue} color={theme.palette.error.main} />
                  <BarLine label="Missing" value={18} color={theme.palette.error.main} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

           <Box
              sx={{
                gridColumn: { xs: '1 / -1', md: 'span 2' },  // take 2 columns on md+, full width on mobile
                width: '100%',
                height: '100%'
              }}
            >
              <Box sx={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={MOCK.rows}
                  columns={columns}
                  density="compact"
                  disableColumnMenu
                  pageSizeOptions={[5, 10]}
                  initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                />
              </Box>
            </Box>
          
        </Box>


        {/* Register */}
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Risk Register</Typography>
            <Typography variant="body2" color="text.secondary">Updated: today, 10:23</Typography>
          </Stack>
          <Box sx={{ height: 360 }}>
            <DataGrid
              rows={MOCK.rows}
              columns={columns}
              density="compact"
              disableColumnMenu
              pageSizeOptions={[5, 10]}
              initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

/* ================================
   Small helpers
   ================================ */
function BarLine({ label, value, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 70 }}>{label}</Typography>
      <Box sx={{ flex: 1, height: 10, bgcolor: 'action.hover', borderRadius: 5, overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(100, value)}%`, height: '100%', bgcolor: color }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 32, textAlign:'right' }}>{value}</Typography>
    </Stack>
  );
}
function LegendDot({ color, label, val }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width:10, height:10, bgcolor: color, borderRadius:'50%' }} />
      <Typography variant="caption">{label}</Typography>
      <Typography variant="caption" color="text.secondary">{val}</Typography>
    </Stack>
  );
}
