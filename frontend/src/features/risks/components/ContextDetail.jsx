import * as React from 'react';
import {
  Box, Stack, Typography, Chip, Tabs, Tab, Divider, LinearProgress, useTheme, Paper, LinearProgress as MuiLinearProgress
} from '@mui/material';
import Sparkline from '../../risks/charts/Sparkline';
import { fetchRiskContextDetail, fetchContextControls } from '../../../api/services/risks';
import { updateRiskContextOwner } from '../../../api/services/risks';
import OwnerPicker from './OwnerPicker';
import { adaptContextControlsResponse } from '../../../api/adapters/controlsContext';

const DOMAINS = ['C','I','A','L','R'];

function RagChip({ rag }) {
  const theme = useTheme();
  const map = {
    Green: theme.palette.success.main,
    Amber: theme.palette.warning.main,
    Yellow: theme.palette.warning.main,
    Red: theme.palette.error.main,
  };
  const bg = map[rag] || theme.palette.grey[500];
  const fg = theme.palette.getContrastText(bg);
  return <Chip size="small" label={rag || '—'} sx={{ bgcolor: bg, color: fg }} />;
}

export default function ContextDetail({ contextId, onLoadedTitle }) {
  const [tab, setTab] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [ctx, setCtx] = React.useState(null);
  const [controlsLoading, setControlsLoading] = React.useState(false);
  const [controls, setControls] = React.useState([]);
  const reload = React.useCallback(async () => {
    console.log('ContextDetail: reload');
  });
    
  React.useEffect(() => {
    if (!contextId) return;
    let alive = true;
    setErr('');
    setCtx(null);
    setLoading(true);
    (async () => {
      try {
        const data = await fetchRiskContextDetail(contextId);
        if (!alive) return;
        setCtx(data);
        onLoadedTitle?.(data?.scenarioTitle);
      } catch (e) {
        if (!alive) return;
        setErr('Could not load context details.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [contextId, onLoadedTitle]);

  // Load controls when tab switches to Controls or context changes
  React.useEffect(() => {
    if (!contextId || tab !== 1) return;
    let alive = true;
    setControlsLoading(true);
    (async () => {
      try {
        const resp = await fetchContextControls(contextId, { include: 'summary', limit: 50, offset: 0, sort_by: 'status', sort_dir: 'asc' });
        if (!alive) return;
        const rows = adaptContextControlsResponse(resp);
        setControls(rows);
      } finally {
        if (alive) setControlsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [contextId, tab]);

  // ---- Overview tab
  const overview = ctx || {};
  const impacts = overview.impacts || {};
  const impactsStr = DOMAINS.map(k => `${k}${impacts[k] ?? 0}`).join('  ');
  const evidence = overview.evidence || { ok: 0, warn: 0, overdue: 0 };
  const controlsSummary = overview.controls || { implemented: 0, total: 0, coverage: 0 };

  return (
    <Box sx={{ display:'flex', flexDirection:'column', minHeight: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
      >
        <Tab label="Overview" />
        <Tab label="Controls" />
        <Tab label="Evidence" />
        <Tab label="History" />
      </Tabs>

      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {err && <Typography color="error" sx={{ mb: 1 }}>{err}</Typography>}

      {/* ---- OVERVIEW ---- */}
      {tab === 0 && (
        <Stack spacing={1.25}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {overview.scenarioTitle || '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Scope: {overview.scopeDisplay || overview.scopeName || overview.scopeRef?.label || overview.scope || '—'}
          </Typography>

          {/* optional: show scenarioDescription if available */}
          {overview.scenarioDescription && (
            <Typography variant="body2" sx={{ mt: .5 }}>
              {overview.scenarioDescription}
            </Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="center">
            <RagChip rag={overview.rag} />
            <Chip size="small" label={overview.severityBand || '—'} />
            {overview.overAppetite ? <Chip size="small" label="Over Appetite" color="error" /> : <Chip size="small" label="Within Appetite" />}
          </Stack>

          <Divider />

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip label={`Likelihood: ${overview.likelihood ?? '—'}`} />
            <Chip label={`Impacts: ${impactsStr}`} />
            <Chip label={`Initial: ${overview.initial ?? '—'}`} />
            <Chip label={`Residual: ${overview.residual ?? '—'}`} />
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <OwnerPicker
              value={overview?.owner_name || 'NA'}
              onChange={async (p) => {
                await updateRiskContextOwner(contextId, p ? p.id : null);
                await reload(); // your detail refetch
              }}
              sx={{ minWidth: 300 }}
            />
            <Chip label={`Status: ${overview.status ?? '—'}`} />
            <Chip label={`Last review: ${overview.lastReview ? new Date(overview.lastReview).toLocaleDateString() : '—'}`} />
            <Chip label={`Next review: ${overview.nextReview ? new Date(overview.nextReview).toLocaleDateString() : '—'}`} />
          </Stack>

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: .5 }}>Controls Coverage</Typography>
              <Typography variant="body2" color="text.secondary">
                Implemented {controlsSummary.implemented ?? 0} / {controlsSummary.total ?? 0}
              </Typography>
              <Box sx={{ mt: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ width: `${Math.min(100, controlsSummary.coverage ?? 0)}%`, height: '100%', bgcolor: 'primary.main' }} />
              </Box>
            </Paper>

            {Array.isArray(controlsSummary.recommended) && controlsSummary.recommended.length > 0 && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: .5 }}>Recommended Controls</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {controlsSummary.recommended.map((t, i) => (
                    <Chip key={i} size="small" label={t} />
                  ))}
                </Stack>
              </Paper>
            )}

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: .5 }}>Evidence Freshness</Typography>
              <Stack spacing={.75}>
                <RowStat label="Fresh" value={evidence.ok} color="success.main" />
                <RowStat label="Due" value={evidence.warn} color="warning.main" />
                <RowStat label="Overdue" value={evidence.overdue} color="error.main" />
              </Stack>
            </Paper>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Updated: {overview.lastUpdated ? new Date(overview.lastUpdated).toLocaleString() : '—'}
          </Typography>
        </Stack>
      )}

      {/* ---- CONTROLS (placeholder until endpoint wired) ---- */}
      {tab === 1 && (
        <Box>
          {controlsLoading && <LinearProgress sx={{ mb: 1 }} />}
          {!controlsLoading && controls.length === 0 && (
            <Typography variant="body2" color="text.secondary">No controls linked.</Typography>
          )}
          {!controlsLoading && controls.length > 0 && (
            <Stack spacing={1}>
              {controls.map((row) => (
                <Paper
                  key={row.linkId || row.controlId}
                  variant="outlined"
                  sx={{ p: 1, borderRadius: 1.5, overflow: 'hidden' }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {/* Left: code/title + chips (truncate long titles) */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={`${row.code || ''} — ${row.title || ''}`}
                      >
                        {row.code || ''} — {row.title || ''}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: .5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={row.status || '—'} />
                        {row.verification && (
                          <Chip size="small" label={row.verification} color="success" variant="outlined" />
                        )}
                        {row.lastEvidenceAt && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`Last: ${new Date(row.lastEvidenceAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })}`}
                          />
                        )}
                      </Stack>
                    </Box>

                    {/* Right: compact meters (fixed small width to keep drawer thin) */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                      <Box sx={{ width: 96 }}>
                        <Typography variant="caption" color="text.secondary">Cov</Typography>
                        <MuiLinearProgress variant="determinate" value={Number(row.coverage ?? 0)} sx={{ height: 6, borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ width: 96 }}>
                        <Typography variant="caption" color="text.secondary">Conf</Typography>
                        <MuiLinearProgress color="secondary" variant="determinate" value={Number(row.confidence ?? 0)} sx={{ height: 6, borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ width: 96 }}>
                        <Typography variant="caption" color="text.secondary">Effect</Typography>
                        <MuiLinearProgress color="success" variant="determinate" value={Number(row.effect ?? 0)} sx={{ height: 6, borderRadius: 1 }} />
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* ---- EVIDENCE (placeholder until endpoint wired) ---- */}
      {tab === 2 && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Evidence artifacts will appear here with freshness badges. Hook to /contexts/{'{id}'}/evidence when ready.
          </Typography>
        </Box>
      )}

      {/* ---- HISTORY (optional sparkline for now) ---- */}
      {tab === 3 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Residual Trend</Typography>
          <Box sx={{ color: 'primary.main' }}>
            <Sparkline data={(overview.trend || []).map(p => p.y)} width="100%" height={80} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hook to /risk_scenario_contexts/history?context_id={contextId}&days=90 when available.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function RowStat({ label, value, color }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 70 }}>{label}</Typography>
      <Box sx={{ flex: 1, height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(100, Number(value) || 0)}%`, height: '100%', bgcolor: color }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign:'right' }}>{value ?? 0}</Typography>
    </Stack>
  );
}
