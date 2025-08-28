import * as React from 'react';
import { 
  Box, Stack, Typography, Chip, Tabs, Tab, Divider, LinearProgress, useTheme, Paper, LinearProgress as MuiLinearProgress, Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Sparkline from '../../risks/charts/Sparkline';
import { useSearchParams } from 'react-router-dom';
import { fetchRiskContextDetail, fetchContextControls, fetchSuggestedControlsForContext, applySuggestedControlToContext, fetchContextEvidence, fetchContextHistory } from '../../../api/services/risks';
import { updateRiskContextOwner } from '../../../api/services/risks';
import OwnerPicker from './OwnerPicker';
import { adaptContextControlsResponse } from '../../../api/adapters/controlsContext';
import { adaptEvidenceResponse } from '../../../api/adapters/evidence';
import { adaptHistoryChanges } from '../../../api/adapters/history';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ScienceIcon from '@mui/icons-material/Science';

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
  const [params] = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [ctx, setCtx] = React.useState(null);
  const [controlsLoading, setControlsLoading] = React.useState(false);
  const [controls, setControls] = React.useState([]);
  const [suggestions, setSuggestions] = React.useState([]);
  const [suggestBusy, setSuggestBusy] = React.useState(false);
  const [evidenceLoading, setEvidenceLoading] = React.useState(false);
  const [evidenceItems, setEvidenceItems] = React.useState([]);
  const [historyLoading, setHistoryLoading] = React.useState(false);
  const [historyItems, setHistoryItems] = React.useState([]);
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

  // Accept deep-link ?tab=overview|controls|evidence|history
  React.useEffect(() => {
    const t = (params.get('tab') || '').toLowerCase();
    const map = { overview: 0, controls: 1, evidence: 2, history: 3 };
    const idx = typeof map[t] === 'number' ? map[t] : 0;
    if (idx !== tab) setTab(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, contextId]);

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
        // Fetch suggestions in parallel (based on scenarioId from overview)
        const sid = ctx?.scenarioId || null;
        if (sid) {
          const sug = await fetchSuggestedControlsForContext({ scenarioId: sid, contextId });
          if (alive) {
            const arr = Array.isArray(sug) ? sug : [];
            // Frontend guard: exclude any suggestion already mapped/implemented for this context
            const existingIds = new Set((rows || []).map((r) => Number(r.controlId)));
            const filtered = arr.filter((s) => !existingIds.has(Number(s.control_id)));
            setSuggestions(filtered);
          }
        } else if (alive) setSuggestions([]);
      } finally {
        if (alive) setControlsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [contextId, tab]);

  // Load history when History tab is selected
  React.useEffect(() => {
    if (!contextId || tab !== 3) return;
    let alive = true;
    setHistoryLoading(true);
    (async () => {
      try {
        const raw = await fetchContextHistory(contextId, { days: 90 });
        if (!alive) return;
        setHistoryItems(adaptHistoryChanges(raw));
      } finally {
        if (alive) setHistoryLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [contextId, tab]);

  // Load evidence when Evidence tab is selected
  React.useEffect(() => {
    if (!contextId || tab !== 2) return;
    let alive = true;
    setEvidenceLoading(true);
    (async () => {
      try {
        const resp = await fetchContextEvidence(contextId, { limit: 50, offset: 0, sort_by: 'captured_at', sort_dir: 'desc' });
        if (!alive) return;
        setEvidenceItems(adaptEvidenceResponse(resp));
      } finally {
        if (alive) setEvidenceLoading(false);
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
            <Chip label={`Target: ${overview.targetResidual ?? '—'}`} />
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <Tooltip title="Residual = current effective value (if provided). Target = planned/implemented residual; '—' if not provided.">
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Residual vs Target (server-gated)</Typography>
              </Box>
            </Tooltip>
          </Box>

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

          <Stack direction={{ xs: 'column' }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: .5 }}>Controls</Typography>
              {/* Implemented / mapped / expired — per‑control chips */}
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {(() => {
                  const links = Array.isArray(overview.controlLinks) ? overview.controlLinks : [];
                  const statusOf = (s) => String(s || '').toLowerCase();
                  const expiryDays = 90;
                  const now = Date.now();
                  const colorFor = (l) => {
                    // expired overrides
                    const ts = l.lastEvidenceAt ? new Date(l.lastEvidenceAt).getTime() : NaN;
                    const isExpired = Number.isFinite(ts) && (now - ts) > expiryDays * 24 * 60 * 60 * 1000;
                    if (isExpired) return 'error';
                    const s = statusOf(l.assuranceStatus);
                    if (/^(implemented|effective|verified|in\s*place)$/.test(s)) return 'success';
                    if (s === 'mapped') return 'info';
                    return 'default';
                  };
                  return links.map((l) => (
                    <Chip
                      key={l.linkId || l.controlId}
                      size="small"
                      color={colorFor(l)}
                      variant={colorFor(l) === 'default' ? 'outlined' : 'filled'}
                      label={`${l.referenceCode || l.code || ''} — ${l.name || l.title || ''}`}
                      sx={{ maxWidth: 320 }}
                    />
                  ));
                })()}
              </Stack>
              {/* Suggested — per‑control chips (if provided by summary) */}
              {Array.isArray(controlsSummary.recommended) && controlsSummary.recommended.length > 0 && (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                  {controlsSummary.recommended.map((t, i) => (
                    <Chip key={`sug-${i}`} size="small" color="warning" label={t} sx={{ maxWidth: 320 }} />
                  ))}
                </Stack>
              )}
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
          {/* Suggestions */}
          {!controlsLoading && suggestions.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="subtitle2" sx={{ mb: .5 }}>Suggested controls</Typography>
              <Stack spacing={1}>
                {suggestions.map((s) => (
                  <Paper key={s.control_id} variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                      <Box sx={{ minWidth: 0, pr: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${s.code || ''} — ${s.title || ''}`}>
                          {s.code || ''} — {s.title || ''}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {typeof s.score === 'number' && <Chip size="small" variant="outlined" label={`Score ${s.score}`} />}
                        <Chip
                          size="small"
                          color="primary"
                          label={suggestBusy ? 'Applying…' : 'Apply'}
                          onClick={async () => {
                            if (suggestBusy) return;
                            setSuggestBusy(true);
                            try {
                              await applySuggestedControlToContext(contextId, s.control_id, 'mapped');
                              // Optimistic update: remove from suggestions and refetch controls
                              setSuggestions((prev) => prev.filter((x) => x.control_id !== s.control_id));
                              // Reuse existing effect to load controls
                              const resp = await fetchContextControls(contextId, { include: 'summary', limit: 50, offset: 0, sort_by: 'status', sort_dir: 'asc' });
                              const rows = adaptContextControlsResponse(resp);
                              setControls(rows);
                            } finally {
                              setSuggestBusy(false);
                            }
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* ---- EVIDENCE ---- */}
      {tab === 2 && (
        <Box>
          {evidenceLoading && <LinearProgress sx={{ mb: 1 }} />}
          {!evidenceLoading && evidenceItems.length === 0 && (
            <Typography variant="body2" color="text.secondary">No evidence.</Typography>
          )}
          {!evidenceLoading && evidenceItems.length > 0 && (
            <Stack spacing={1}>
              {evidenceItems.map((ev) => {
                const color = ev.freshness === 'overdue' ? 'error' : ev.freshness === 'warn' ? 'warning' : 'success';
                const Icon = ev.type === 'url' ? LinkIcon : ev.type === 'doc' ? DescriptionIcon : ev.type === 'ticket' ? ConfirmationNumberIcon : ScienceIcon;
                return (
                  <Paper key={ev.id} variant="outlined" sx={{ p: 1, borderRadius: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, pr: 1 }}>
                        <Icon fontSize="small" />
                        <Typography variant="body2" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.ref}>
                          {ev.type === 'url' && ev.ref ? (
                            <a href={ev.ref} target="_blank" rel="noopener noreferrer">{ev.ref}</a>
                          ) : ev.ref || '(no reference)'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                        {ev.capturedAt && (
                          <Chip size="small" variant="outlined" label={new Date(ev.capturedAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} />
                        )}
                        <Chip size="small" color={color} label={ev.freshness} />
                      </Stack>
                    </Stack>
                    {ev.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .5 }}>{ev.notes}</Typography>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* ---- HISTORY (optional sparkline for now) ---- */}
      {tab === 3 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Residual Trend</Typography>
          <Box sx={{ color: 'primary.main' }}>
            <Sparkline data={(overview.trend || []).map(p => p.y)} width="100%" height={80} />
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: .5 }}>Change Log</Typography>
          {historyLoading && <LinearProgress sx={{ mb: 1 }} />}
          {!historyLoading && historyItems.length === 0 && (
            <Typography variant="body2" color="text.secondary">No changes.</Typography>
          )}
          {!historyLoading && historyItems.length > 0 && (
            <Stack spacing={.5}>
              {historyItems.map((h, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" sx={{ minWidth: 0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    <strong>{h.field}</strong>: {String(h.from)} → {String(h.to)}
                  </Typography>
                  <Chip size="small" variant="outlined" label={new Date(h.ts).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })} />
                </Stack>
              ))}
            </Stack>
          )}
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
