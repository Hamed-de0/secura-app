import * as React from 'react';
import { Box, Grid} from '@mui/material';
// ---- System --------------------------------
import { fetchRiskMetrics } from '../../../api/services/risks';
import { fetchRiskContexts } from '../../../api/services/risks';
import { adaptContextsToRegisterRows } from '../../../api/adapters/risks';
// ---- Icons ---------------------------------
import KPIStrip from '../components/KPIStrip';
import HeatmapCard from '../components/HeatmapCard';
import SeverityDonutCard from '../components/SeverityDonutCard';
import ResidualTrendCard from '../components/ResidualTrendCard';
import ReviewSLACard from '../components/ReviewSLACard';
import EvidenceFreshnessCard from '../components/EvidenceFreshnessCard';
import ScopeGrid from '../components/ScopeGrid';
import RegisterGrid from '../components/RegisterGrid';

/* ================================
   Static mock data (tune later)
   ================================ */
const MOCK = {
  totals: { scenarios: 226, contexts: 157, scopes: 38, assets: 24 },
  severity: { Low: 150, Medium: 0, High: 7, Critical: 0 },
  evidence: { ok: 86, warn: 12, overdue: 6, missing: 18 },
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


export default function RiskDashboard({ size = { width: '100%' } }) {
  const widthPx = typeof size?.width === 'number' ? `${size.width}px` : size?.width || '100%';
  const [metricsData, setMetricsData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

    // Register grid state
  const [gridModel, setGridModel] = React.useState({ page: 0, pageSize: 10 });
  const [gridRows, setGridRows] = React.useState([]);
  const [gridTotal, setGridTotal] = React.useState(0);
  const [gridLoading, setGridLoading] = React.useState(false);

  // Reuse the same filters you used for metrics
  const baseFilters = React.useMemo(
    () => ({ scope: 'all', status: 'all', domain: 'all', days: 90 }),
    []
  );

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setGridLoading(true);
      try {
        const res = await fetchRiskContexts({
          ...baseFilters,
          offset: gridModel.page * gridModel.pageSize,
          limit: gridModel.pageSize,
          sort_by: 'id',
          sort_dir: 'desc',
        });
        if (!alive) return;
        setGridTotal(res?.total ?? 0);
        setGridRows(adaptContextsToRegisterRows(res?.items || []));
      } finally {
        if (alive) setGridLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [baseFilters, gridModel.page, gridModel.pageSize]);
  
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const m = await fetchRiskMetrics({ scope: 'all', status: 'all', domain: 'all', days: 90 });
        if (alive) setMetricsData(m);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const m = metricsData || {};
  const total = m.total ?? 0;
  const sev = m.severityCounts || {};
  const evidence = m.evidence || {};
  const review = m.reviewSLA || {};


  const pct = (num, den) => {
    const n = Number(num ?? 0), d = Number(den ?? 0);
    return d > 0 ? `${Math.round((n / d) * 100)}` : '0';
  };

  const scorePct= Number(pct(review.onTrack, (review.onTrack ?? 0) + (review.dueSoon ?? 0) + (review.overdue ?? 0)));


  const metrics = {
    exposure: {
      total: total,
      highCritical: (sev.High ?? 0) + (sev.Critical ?? 0),
      avgResidual: Math.round(m.avgResidual ?? 0),
      trend: [42, 44, 43, 47, 49, 48, 50, 51], // keep your mock spark until you add a series
    },
    appetite: {
      count: m.overAppetite ?? 0,
      percent: `${pct(m.overAppetite, total)}%`,
      exceptions30: m.exceptionsExpiring30d ?? 0,
    },
    ownership: {
      withOwner: m.ownerAssigned ?? 0,
      withOwnerPct: `${pct(m.ownerAssigned, total)}%`,
      mitigations: m.mitigationsInProgress ?? 0,
    },
    assurance: {
      evidencePct: `${pct(evidence.ok, (evidence.ok ?? 0) + (evidence.warn ?? 0) + (evidence.overdue ?? 0))}%`,
      reviewPct: `${pct(review.onTrack, (review.onTrack ?? 0) + (review.dueSoon ?? 0) + (review.overdue ?? 0))}%`,
    },
    improvement: {
      days: 30,
      delta: `-${m.residualReduction30d ?? 0}`,
    },
  };

  const heatmapMatrix = React.useMemo(() => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    const hm = m.heatmap || {};
    Object.entries(hm).forEach(([key, val]) => {
      const [iStr, lStr] = key.split('x');
      const i = parseInt(iStr, 10), l = parseInt(lStr, 10);
      if (i >= 1 && i <= 5 && l >= 1 && l <= 5) grid[5 - i][l - 1] = val || 0;
    });
    console.table(grid);
    return grid;
  }, [m.heatmap]);

  return (
    <Box sx={{ display:'flex', justifyContent:'left', p: 1}} size={12}>
      <Box sx={{ width: widthPx, display:'grid', gap: 3, }} size={12}>
        
        {/* KPIs */}
        <KPIStrip data={metrics} />
        {/* Heatmap and Donuts */}
        <Box sx={{display: 'grid', gap: 2, p:1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' } , }} >
          {/* Heatmap + Domain chips */}
          <Grid item xs={12} md={7}>
            <HeatmapCard matrix={heatmapMatrix} onCell={(i,l)=>{ /* no-op for static */ }} />
          </Grid>

          {/* Donut + legend */}
          <Grid item xs={12} md={5} sx={{}} >
            <SeverityDonutCard stroke={25} size={200} counts={m.severityCounts || { Low:0, Medium:0, High:0, Critical:0 }} />
            {/* <ResidualTrendCard series={review} /> */}
          </Grid>

          {/* Evidence + SLA */}
          <Grid item xs={12} md={5} sx={{}}>
            <ReviewSLACard data={{...review, scorePct}} />
            <EvidenceFreshnessCard data={evidence} />
          </Grid>

          {/* Scope Grid */}
          <ScopeGrid />
                    
        </Box>

        {/* Register */}
        <RegisterGrid 
          rows={gridRows}
          total={gridTotal}
          loading={gridLoading}
          paginationModel={gridModel}
          onPaginationModelChange={setGridModel} 
          
        />


      </Box>
    </Box>
  );
}

