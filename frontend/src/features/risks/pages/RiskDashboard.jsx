import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Box, Grid, useTheme, Chip, Typography } from '@mui/material';
// ---- System --------------------------------
import { fetchRiskMetrics } from '../../../api/services/risks';
import { fetchRiskContexts } from '../../../api/services/risks';
import { adaptContextsToRegisterRows } from '../../../api/adapters/risks';
import { adaptRiskOpsMetrics } from '../../../api/adapters/metrics';
import { fetchRiskOpsQueues } from '../../../api/services/dashboards';
import { summarizeQueues } from '../../../api/adapters/queues';
// ---- Icons ---------------------------------
import KPIStrip from '../components/KPIStrip';
import HeatmapCard from '../components/HeatmapCard';
import SeverityDonutCard from '../components/SeverityDonutCard';
import ResidualTrendCard from '../components/ResidualTrendCard';
import ReviewSLACard from '../components/ReviewSLACard';
import EvidenceFreshnessCard from '../components/EvidenceFreshnessCard';
import ScopeGrid from '../components/ScopeGrid';
import { useMemo } from 'react';

import RiskContextsGrid from '../components/RiskContextsGrid';
import RiskCustomGrid from '../../risks/components/RiskCustomGrid';
import RiskOpsQueueTabs from '../../dashboards/components/RiskOpsQueueTabs';
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
  const firstDone = useRef(false);
  useEffect(() => { if (import.meta.env.VITE_DIAG_RISK==='1') console.time('RiskDashboard.mount'); }, []);
  const widthPx = typeof size?.width === 'number' ? `${size.width}px` : size?.width || '100%';
  const [metricsData, setMetricsData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [queuesSummary, setQueuesSummary] = React.useState(null);

    // Register grid state
  const [gridModel, setGridModel] = React.useState({ page: 0, pageSize: 10 });
  const [gridRows, setGridRows] = React.useState([]);
  const [gridTotal, setGridTotal] = React.useState(0);
  const [gridLoading, setGridLoading] = React.useState(false);

  const theme = useTheme();

  // Reuse the same filters you used for metrics
  const baseFilters = React.useMemo(
    () => ({ scope: 'all', status: 'all', domain: 'all', days: 90, sort: 'residual', sort_dir: 'desc' }),
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
          
          status: 'all',
        });
        if (!alive) return;
        setGridTotal(res?.total ?? 0);
        setGridRows(res?.items || []);
        console.log('RiskDashboard: fetched grid', { res }); // DEBUG
      } finally {
        if (alive) setGridLoading(false);
        console.log('RiskDashboard: grid loaded', { alive, gridTotal, gridRows }); // DEBUG
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

  // End timing on first data-ready render (when metrics loaded)
  useEffect(() => {
    if (import.meta.env.VITE_DIAG_RISK!=='1' || firstDone.current) return;
    const ready = !!metricsData; // treat metrics arrival as ready signal
    if (ready) { console.timeEnd('RiskDashboard.mount'); firstDone.current = true; }
  }, [metricsData]);

  

  

  const m = metricsData || {};
  const kpis = React.useMemo(() => adaptRiskOpsMetrics(metricsData || {}), [metricsData]);
  const evidence = m.evidence || {};
  const review = m.reviewSLA || {};


  const pct = (num, den) => {
    const n = Number(num ?? 0), d = Number(den ?? 0);
    return d > 0 ? `${Math.round((n / d) * 100)}` : '0';
  };

  const scorePct= Number(pct(review.onTrack, (review.onTrack ?? 0) + (review.dueSoon ?? 0) + (review.overdue ?? 0)));


  // KPIs normalized via adapter
  const metrics = kpis;

  const heatmapMatrix = React.useMemo(() => {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(0));
    const hm = m.heatmap || {};
    Object.entries(hm).forEach(([key, val]) => {
      const [iStr, lStr] = key.split('x');
      const i = parseInt(iStr, 10), l = parseInt(lStr, 10);
      if (i >= 1 && i <= 5 && l >= 1 && l <= 5) grid[5 - i][l - 1] = val || 0;
    });
    // console.table(grid);
    return grid;
  }, [m.heatmap]);

  const [filters, setFilters] = React.useState({
    search: '', scope:'all', status:'all', domain:'all', days: 90, overAppetite:false,
  });

  return (
    <Box sx={{ display:'flex', justifyContent:'left', p: 1}} size={12}>
      <Box sx={{ width: widthPx, display:'grid', gap: 3, }} size={12}>
        
        {/* KPIs (normalized from metrics adapter) */}
        <KPIStrip data={metrics} />
        {!!kpis?.meta?.asOf && (
          <Typography variant="caption" sx={{ ml: 1, mt: -1, opacity: 0.7 }}>
            As of {new Date(kpis.meta.asOf).toLocaleString(undefined, { timeZone: 'Europe/Berlin' })}
          </Typography>
        )}
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

        {/* Risk Ops KPIs (counts from queues endpoint if available) */}
        {/* <Box sx={{
          p: 1,
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' },
        }}>
          {([
            { label: 'Over Appetite', key: 'overAppetite' },
            { label: 'Reviews Due', key: 'reviewsDue' },
            { label: 'Evidence Overdue', key: 'evidenceOverdue' },
            { label: 'Controls Awaiting Verification', key: 'awaitingVerification' },
            { label: 'Exceptions Expiring', key: 'exceptionsExpiring' },
            { label: 'New/Changed', key: 'recentChanges' },
          ]).map((item, idx) => (
            <Box key={idx} sx={{
              borderRadius: 2,
              border: theme => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              px: 1.5, py: 1,
            }}>
              <Typography variant="overline" sx={{ opacity: 0.8 }}>
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {queuesSummary?.[item.key] ?? '—'}
              </Typography>
            </Box>
          ))}
        </Box> */}

        {/* Action Queue tabs (scaffold) */}
        {/* <RiskOpsQueueTabs /> */}

        {/* Register */}
        {/* <RiskContextsGrid
          columns={DASH_COLUMNS}
          height={360}
          pageSize={10}
          compactToolbar
          orderMenuItems={useMemo(() => ([
            { label: 'Updated (newest)',        sort: { field:'updatedAt', sort:'desc' } },
            { label: 'Residual (high → low)',  sort: { field:'residual',  sort:'desc' } },
            { label: 'Likelihood (high → low)',sort: { field:'likelihood',sort:'desc' } },
          ]), [])}
          detailsMode="lazy"   // ⟵ prevent per-row evidence/controls eager fetch          
          filters={filters}
          onFiltersChange={setFilters}
          onRowClick={(row)=>{/* open drawer }}
        /> */}
        <RiskCustomGrid
          rows={gridRows}
          total={gridTotal}
          loading={gridLoading}
          height={360}
          pageSize={10}
          //columns={DASH_COLUMNS}
          sortingModel={[{ field: 'residual', sort: 'desc' }]}
          onSortingModelChange={()=>{}}
          onRowClick={(row)=>{/* open drawer */}}
          paginationModel={gridModel}
          onPaginationModelChange={setGridModel}
         
        />

        


      </Box>
    </Box>
  );
}
