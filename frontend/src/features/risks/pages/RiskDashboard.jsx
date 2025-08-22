import * as React from 'react';
import { Box, Grid} from '@mui/material';

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
  
  return (
    <Box sx={{ display:'flex', justifyContent:'left', p: 1}} size={12}>
      <Box sx={{ width: widthPx, display:'grid', gap: 3, }} size={12}>
        
        {/* KPIs */}
        <KPIStrip />
        {/* Heatmap and Donuts */}
        <Box sx={{display: 'grid', gap: 2, p:1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' } , }} >
          {/* Heatmap + Domain chips */}
          <Grid item xs={12} md={7}>
            <HeatmapCard matrix={MOCK.heatmap} onCell={(i,l)=>{ /* no-op for static */ }} />
          </Grid>

          {/* Donut + legend */}
          <Grid item xs={12} md={5} sx={{}} >
            <SeverityDonutCard counts={MOCK.severity} />
            <ResidualTrendCard series={MOCK.trend} />
          </Grid>

          {/* Evidence + SLA */}
          <Grid item xs={12} md={5} sx={{}}>
            <ReviewSLACard data={MOCK.review} />
            <EvidenceFreshnessCard data={MOCK.evidence} />
          </Grid>

          {/* Scope Grid */}
          <ScopeGrid />
                    
        </Box>

        {/* Register */}
        <RegisterGrid rows={MOCK.rows} />


      </Box>
    </Box>
  );
}

