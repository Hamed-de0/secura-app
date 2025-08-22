import * as React from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Chip, Stack, Divider, ThemeProvider, createTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getJSON, buildSearchParams } from '../../api/httpClient';

/** ---------- tiny SVG widgets (no external libs) ---------- */
function Spark({ data = [6,7,6,8,9,8,10], width = 180, height = 48 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const pad = 6;
  const pts = data.map((v, i) => {
    const x = pad + (i * (width - 2 * pad)) / Math.max(1, data.length - 1);
    const y = pad + (height - 2 * pad) * (1 - (v - min) / Math.max(1, max - min));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} aria-label="spark">
      <polyline points={pts} fill="none" stroke="#7e8bff" strokeWidth="2.5" />
    </svg>
  );
}

function Donut({ segments = [], size = 140, stroke = 14 }) {
  // segments: [{value, color, label}]
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = size / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="donut">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#26304a" strokeWidth={stroke} />
      {segments.map((s, i) => {
        const frac = s.value / total;
        const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
        acc += s.value;
        const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const x0 = c + r * Math.cos(a0), y0 = c + r * Math.sin(a0);
        const x1 = c + r * Math.cos(a1), y1 = c + r * Math.sin(a1);
        return (
          <path key={i}
            d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`}
            stroke={s.color} strokeWidth={stroke} fill="none" />
        );
      })}
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#b7c0d9" style={{ fontSize: 12 }}>
        Severity
      </text>
    </svg>
  );
}

function Gauge({ value = 0, max = 100, size = 160 }) {
  // semicircle gauge (0..max)
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  const start = Math.PI, end = Math.PI * (1 - pct);
  const x = cx + r * Math.cos(end), y = cy + r * Math.sin(end);
  const arcBg = describeArc(cx, cy, r, 180, 0);
  const arcFg = describeArc(cx, cy, r, 180, 180 - 180 * pct);
  return (
    <svg width={size} height={size/1.6} aria-label="gauge">
      <path d={arcBg} stroke="#26304a" strokeWidth="12" fill="none" />
      <path d={arcFg} stroke="#2ecc71" strokeWidth="12" fill="none" />
      <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle" fill="#b7c0d9" style={{ fontSize: 22, fontWeight: 700 }}>
        {Math.round(value)}
      </text>
    </svg>
  );
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

/** ---------- helpers ---------- */
const sevColors = { Low: '#6ea8fe', Medium: '#f9a825', High: '#ff7a36', Critical: '#ff4d4f' };

function toGridCounts(heatmapObj) {
  // returns 5x5 matrix [impact:5..1][likelihood:1..5]
  const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
  if (!heatmapObj) return grid;
  Object.entries(heatmapObj).forEach(([key, val]) => {
    const [iStr, lStr] = key.split('x');
    const i = parseInt(iStr, 10); const l = parseInt(lStr, 10);
    if (i >= 1 && i <= 5 && l >= 1 && l <= 5) {
      grid[5 - i][l - 1] = val || 0; // row 0 = impact 5
    }
  });
  return grid;
}

function mix(a, b, t) {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const r = Math.round(((ca >> 16) * (1 - t)) + ((cb >> 16) * t));
  const g = Math.round((((ca >> 8) & 0xff) * (1 - t)) + (((cb >> 8) & 0xff) * t));
  const bl = Math.round(((ca & 0xff) * (1 - t)) + ((cb & 0xff) * t));
  return `#${(r << 16 | g << 8 | bl).toString(16).padStart(6, '0')}`;
}

/** ---------- main component ---------- */
export default function RiskDashboard({
  size = { width: '100%' },
  initialFilters = { scope: 'all', status: 'all', domain: 'all', days: 90, search: '', owner_id: '', over_appetite: '' },
}) {
  const widthPx = typeof size?.width === 'number' ? `${size.width}px` : size?.width || '100%';

  const [filters, setFilters] = React.useState(initialFilters);
  const [metrics, setMetrics] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

  // Theme (scoped dark mode)

  async function fetchMetrics() {
    const searchParams = buildSearchParams({
      scope: filters.scope, status: filters.status, domain: filters.domain, days: filters.days,
      search: filters.search || undefined, owner_id: filters.owner_id || undefined, over_appetite: filters.over_appetite || undefined
    });
    const data = await getJSON('risk_scenario_contexts/metrics/', { searchParams });
    setMetrics(data);
  }

  async function fetchPage() {
    const searchParams = buildSearchParams({
      offset: page * pageSize, limit: pageSize,
      sort_by: 'updated_at', sort_dir: 'desc',
      scope: filters.scope, status: filters.status, domain: filters.domain, days: filters.days,
      search: filters.search || undefined, owner_id: filters.owner_id || undefined, over_appetite: filters.over_appetite || undefined
    });
    setLoading(true);
    try {
      const data = await getJSON('risk_scenario_contexts/contexts/', { searchParams });
      setRows(Array.isArray(data?.items) ? data.items : []);
      setTotal(data?.total ?? 0);
    } finally { setLoading(false); }
  }

  React.useEffect(() => { fetchMetrics(); fetchPage(); /* eslint-disable-next-line */ }, [page, pageSize, JSON.stringify(filters)]);

  // Derived for charts
  const grid = toGridCounts(metrics?.heatmap || {});
  const maxCell = Math.max(...grid.flat(), 1);
  const sevSegs = [
    { label: 'Low', value: metrics?.severityCounts?.Low ?? 0, color: sevColors.Low },
    { label: 'Medium', value: metrics?.severityCounts?.Medium ?? 0, color: sevColors.Medium },
    { label: 'High', value: metrics?.severityCounts?.High ?? 0, color: sevColors.High },
    { label: 'Critical', value: metrics?.severityCounts?.Critical ?? 0, color: sevColors.Critical },
  ];
  const evidence = metrics?.evidence || { ok: 0, warn: 0, overdue: 0 };
  const review = metrics?.reviewSLA || { onTrack: 0, dueSoon: 0, overdue: 0 };

  // Columns for DataGrid
  const columns = React.useMemo(() => ([
    { field: 'scenarioTitle', headerName: 'Scenario', flex: 1.3, minWidth: 220 },
    { field: 'scope', headerName: 'Scope', width: 120, valueGetter: p => p.row.scopeName || p.row.scopeRef?.label || p.row.scope },
    { field: 'likelihood', headerName: 'L', width: 60, align: 'center', headerAlign: 'center' },
    { field: 'impacts', headerName: 'I', width: 60, align: 'center', headerAlign: 'center', valueGetter:p => Math.max(...Object.values(p.row.impacts || {C:0,I:0,A:0,L:0,R:0})) },
    { field: 'initial', headerName: 'Initial', width: 80, align:'center', headerAlign:'center' },
    { field: 'residual', headerName: 'Residual', width: 90, align:'center', headerAlign:'center',
      renderCell:(p)=>(<Chip label={p.value} size="small" sx={{ bgcolor:'#233156', color:'#d6def5' }} />) },
    { field: 'owner', headerName: 'Owner', width: 140 },
    { field: 'status', headerName: 'Status', width: 110 },
  ]), []);

  // Heatmap click → filter client-side (likelihood & impact)
  function onHeatCellClick(i /* impact 5..1 */, l /* likelihood 1..5 */) {
    // If backend later supports, set filters. For now, just move to page 0 so the grid refreshes.
    setPage(0);
    // Optionally you could set temp UI highlight here.
  }

  return (
      <Box sx={{ width:'100%', display:'flex', justifyContent:'center', py: 2 }}>
        <Box sx={{ width: widthPx, display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap: 16 }}>
          
          {/* Left column: Totals + Domain & Heatmap + Trend mini */}
          <Box sx={{ display:'grid', gap: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card><CardContent>
                  <Typography variant="overline" color="text.secondary">Total Risks</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{metrics?.total ?? '—'}</Typography>
                </CardContent></Card>
              </Grid>
              <Grid item xs={6}>
                <Card><CardContent>
                  <Typography variant="overline" color="text.secondary">Over-Appetite</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>{metrics?.overAppetite ?? 0}</Typography>
                </CardContent></Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="overline" color="text.secondary">Domain</Typography>
                    {['All','C','I','A','L','R'].map(d => (
                      <Chip key={d} size="small" label={d}
                        onClick={() => setFilters(f => ({ ...f, domain: d.toLowerCase() === 'all' ? 'all' : d }))}
                        sx={{ bgcolor: (filters.domain === d || (d==='All' && filters.domain==='all')) ? '#1f2a44' : '#12182a', color:'#b7c0d9' }} />
                    ))}
                  </Stack>
                  <Chip size="small" label="Filters" sx={{ bgcolor:'#1f2a44', color:'#b7c0d9' }} />
                </Stack>

                {/* Heatmap */}
                <Box sx={{ mt: 2, display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap: 0.75 }}>
                  {grid.map((row, rIdx) => row.map((val, cIdx) => {
                    const t = val / maxCell;
                    const color = mix('#2a3557', '#ff7a36', Math.pow(t, 0.65));
                    const impactLabel = 5 - rIdx;
                    const likelihoodLabel = cIdx + 1;
                    return (
                      <Box key={`${rIdx}-${cIdx}`}
                        onClick={() => onHeatCellClick(impactLabel, likelihoodLabel)}
                        sx={{
                          aspectRatio:'1/1', borderRadius: 1.5, bgcolor: color,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          cursor:'pointer', userSelect:'none',
                          '&:hover': { filter: 'brightness(1.08)' }
                        }}>
                        <Typography variant="body2" sx={{ color:'#e6ecff', fontWeight:700 }}>{val}</Typography>
                      </Box>
                    );
                  }))}
                </Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Likelihood</Typography>
                  <Typography variant="caption" color="text.secondary">Impact</Typography>
                </Stack>

                <Box sx={{ mt: 2 }}><Spark /></Box>
              </CardContent>
            </Card>
          </Box>

          {/* Middle column: Severity donut + Residual trend */}
          <Box sx={{ display:'grid', gap: 16 }}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Donut segments={sevSegs} />
                  <Box>
                    {sevSegs.map(s => (
                      <Stack key={s.label} direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Box sx={{ width:10, height:10, bgcolor:s.color, borderRadius:'50%' }} />
                        <Typography variant="body2" sx={{ minWidth: 80 }}>{s.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{s.value}</Typography>
                      </Stack>
                    ))}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Residual Risk Trend</Typography>
                <Box sx={{ mt: 1 }}><Spark /></Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right column: Evidence & Review SLA */}
          <Box sx={{ display:'grid', gap: 16 }}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Evidence Freshness</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Bar label="Fresh" value={evidence.ok} color="#2ecc71" />
                  <Bar label="Due" value={evidence.warn} color="#f9a825" />
                  <Bar label="Overdue" value={evidence.overdue} color="#ff4d4f" />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">Review SLA</Typography>
                <Gauge value={(review.onTrack + review.dueSoon + review.overdue) ? (review.onTrack / (review.onTrack + review.dueSoon + review.overdue)) * 100 : 0} />
                <Stack direction="row" justifyContent="space-around" sx={{ mt: -1 }}>
                  <LegendDot color="#2ecc71" label="On Track" val={review.onTrack} />
                  <LegendDot color="#f9a825" label="Due" val={review.dueSoon} />
                  <LegendDot color="#ff4d4f" label="Overdue" val={review.overdue} />
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {/* Full-width bottom: Register table */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Paper sx={{ p: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Updated: {metrics?.asOf ? new Date(metrics.asOf).toLocaleString() : '—'}
              </Typography>
              <Box sx={{ height: 360 }}>
                <DataGrid
                  loading={loading}
                  rows={rows}
                  getRowId={(r) => r.contextId}
                  columns={columns}
                  pageSizeOptions={[10, 25, 50]}
                  paginationModel={{ page, pageSize }}
                  onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
                  disableColumnMenu
                  density="compact"
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
   
  );
}

/** small helpers for Evidence legend bars */
function Bar({ label, value, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 70 }}>{label}</Typography>
      <Box sx={{ flex: 1, height: 10, bgcolor: '#26304a', borderRadius: 5, overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(100, value)}%`, height: '100%', bgcolor: color }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign:'right' }}>{value}</Typography>
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
