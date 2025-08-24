// src/features/risks/builder/steps/StepPrefill.jsx
import * as React from 'react';
import {
  Box, Stack, Typography, Card, CardContent, Chip, Button,
  Slider, Divider, Tooltip, useTheme
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const DOMAINS = ['C','I','A','L','R']; // impact domains

export default function StepPrefill({ rows, setRows }) {
  const theme = useTheme();

  // Keep original engine values for ALL rows (for global reset)
  const originalRef = React.useRef(new Map());
  React.useEffect(() => {
    const map = originalRef.current;
    rows.forEach(r => {
      if (!map.has(r.id)) {
        map.set(r.id, { likelihood: r.likelihood, impacts: { ...(r.impacts || {}) } });
      }
    });
  }, [rows]);

  // Build cohorts (group by scope type + hints)
  const cohorts = React.useMemo(() => buildCohorts(rows), [rows]);
  const cohortKeys = React.useMemo(() => Object.keys(cohorts), [cohorts]);

  const [activeKey, setActiveKey] = React.useState(cohortKeys[0] || null);
  React.useEffect(() => {
    if (!activeKey && cohortKeys.length) setActiveKey(cohortKeys[0]);
    if (activeKey && !cohorts[activeKey] && cohortKeys.length) setActiveKey(cohortKeys[0]);
  }, [activeKey, cohorts, cohortKeys]);

  const active = activeKey ? cohorts[activeKey] : null;

  // Slider state seeded from cohort averages
  const [sliders, setSliders] = React.useState(() => mkSliderState(active));
  React.useEffect(() => { setSliders(mkSliderState(active)); }, [activeKey]); // reseed when switching cohorts

  // ----- Global header actions (keep) -----
  const setL3ToAll = React.useCallback(() => {
    setRows(prev => prev.map(r => recompute({ ...r, likelihood: 3 })));
    if (active) setSliders(s => ({ ...s, likelihood: 3 }));
  }, [setRows, active]);

  const resetAll = React.useCallback(() => {
    setRows(prev => prev.map(r => {
      const o = originalRef.current.get(r.id);
      return recompute({
        ...r,
        likelihood: o?.likelihood ?? r.likelihood,
        impacts: { ...(r.impacts || {}), ...(o?.impacts || {}) },
      });
    }));
    setSliders(mkSliderState(active));
  }, [setRows, active]);

  // ----- Auto-apply on slider change -----
  const applyToCohortField = React.useCallback((field, value) => {
    if (!active) return;
    setRows(prev => prev.map(r => {
      if (!active.ids.includes(r.id)) return r;
      const next = { ...r };
      if (field === 'likelihood') next.likelihood = value;
      else next.impacts = { ...(next.impacts || {}), [field]: value };
      return recompute(next);
    }));
  }, [active, setRows]);

  const handleSliderChange = React.useCallback((field, value) => {
    setSliders(s => {
      const next = field === 'likelihood'
        ? { ...s, likelihood: value }
        : { ...s, impacts: { ...s.impacts, [field]: value } };
      return next;
    });
    applyToCohortField(field, value); // immediate apply
  }, [applyToCohortField]);

  // UI helpers
  const ragChip = (rag) => (
    <Chip size="small"
      label={rag}
      color={rag === 'Red' ? 'error' : rag === 'Amber' ? 'warning' : 'success'}
      sx={{ ml: .5 }}
    />
  );

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      {/* Header actions */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2">Prefilled scoring (edit by cohort)</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Set likelihood = 3 for all">
            <Button size="small" onClick={setL3ToAll}>L=3 to ALL</Button>
          </Tooltip>
          <Tooltip title="Reset all to engine prefill">
            <Button size="small" startIcon={<RestartAltIcon />} onClick={resetAll}>Reset ALL</Button>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Cohort selector */}
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: .5 }}>
        {cohortKeys.map(key => {
          const c = cohorts[key];
          const selected = key === activeKey;
          return (
            <Card
              key={key}
              onClick={() => setActiveKey(key)}
              sx={{
                borderRadius: 2, cursor: 'pointer', minWidth: 220,
                border: '1px solid', borderColor: selected ? 'primary.main' : 'divider',
                boxShadow: selected ? 3 : 0, transition: 'all .12s',
              }}
            >
              <CardContent sx={{ py: 1.25 }}>
                <Stack spacing={.5}>
                  <Typography variant="subtitle2" noWrap>{c.label}</Typography>
                  <Stack direction="row" spacing={.5} flexWrap="wrap">
                    {c.tags.map(t => <Chip key={t} size="small" label={t} variant="outlined" />)}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {c.count} candidate{c.count>1?'s':''}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Sliders for active cohort (all vertical in one row, auto-apply) */}
      {active ? (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack
              direction="row"
              spacing={3}
              alignItems="stretch"
              sx={{ flexWrap: 'wrap' }}
            >
              <VerticalSlider
                label="Likelihood"
                value={sliders.likelihood}
                onChange={(v) => handleSliderChange('likelihood', v)}
              />
              {DOMAINS.map(d => (
                <VerticalSlider
                  key={d}
                  label={d}
                  value={sliders.impacts[d]}
                  onChange={(v) => handleSliderChange(d, v)}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 2 }}><CardContent><Typography color="text.secondary">No candidates.</Typography></CardContent></Card>
      )}

      {/* Candidate list (compact) */}
      {active && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Candidates in cohort</Typography>
            <Stack spacing={.75} sx={{ maxHeight: 360, overflow: 'auto' }}>
              {active.ids.map(id => {
                const r = rows.find(x => x.id === id);
                if (!r) return null;
                const pill = `L${r.likelihood} • ${DOMAINS.map(d => `${d}${r.impacts?.[d] ?? 0}`).join(' ')}`;
                return (
                  <Stack
                    key={id}
                    direction={{ xs:'column', sm:'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs:'flex-start', sm:'center' }}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1 }}
                  >
                    <Stack spacing={.25}>
                      <Typography variant="body2" noWrap>{r.scenarioTitle}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{r.scopeLabel}</Typography>
                      <Stack direction="row" spacing={.5} flexWrap="wrap" sx={{ mt: .25 }}>
                        {(r.rationale || []).map((t,i)=>(
                          <Chip key={i} size="small" label={t} variant="outlined" />
                        ))}
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs:.75, sm:0 } }}>
                      <Chip size="small" label={pill} />
                      <Chip size="small" label={String(r.residual)} />
                      {ragChip(r.rag)}
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display:'block' }}>
              Candidates: {active.count}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

/* ---------- helpers ---------- */

function recompute(row) {
  // 5x5 scale -> residual max 25; adjust RAG to <=25 thresholds
  const imp = row.impacts || {};
  const maxImpact = Math.max(imp.C || 0, imp.I || 0, imp.A || 0, imp.L || 0, imp.R || 0);
  const residual = (row.likelihood || 0) * maxImpact;
  let rag = 'Green';
  if (residual > 20) rag = 'Red';
  else if (residual > 10) rag = 'Amber';
  return { ...row, residual, rag, overAppetite: residual > 20 };
}

function mkSliderState(cohort) {
  if (!cohort) return { likelihood: 3, impacts: { C:3, I:3, A:3, L:3, R:3 } };
  const avgL = roundAvg(cohort.rows.map(r => r.likelihood));
  const avgI = (k) => roundAvg(cohort.rows.map(r => r.impacts?.[k] ?? 0));
  return { likelihood: avgL, impacts: { C: avgI('C'), I: avgI('I'), A: avgI('A'), L: avgI('L'), R: avgI('R') } };
}

function roundAvg(nums) {
  if (!nums?.length) return 3;
  const s = nums.reduce((a,b)=>a+(Number(b)||0), 0);
  return clamp(Math.round(s / nums.length));
}

function clamp(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function buildCohorts(rows = []) {
  const out = {};
  for (const r of rows) {
    const type = (r.scopeRef?.type || 'scope').replace('_', ' ');
    const tags = deriveTags(r);
    const key = `${type}|${tags.sort().join(',')}`;
    if (!out[key]) out[key] = { key, label: titleCase(type), tags, ids: [], rows: [], count: 0 };
    out[key].ids.push(r.id);
    out[key].rows.push(r);
    out[key].count += 1;
  }
  return out;
}

function deriveTags(r) {
  const tags = new Set();
  const rationale = r.rationale || [];
  const lab = r.scopeLabel || '';
  const t = (r.scopeRef?.type || '').toLowerCase();
  if (t === 'asset_type') tags.add('Type');
  if (t === 'asset') tags.add('Asset');
  if (t === 'group') tags.add('Group');
  if (t === 'entity') tags.add('Entity');
  if (t === 'provider') tags.add('Provider');
  if (rationale.some(x => /internet/i.test(x))) tags.add('Internet-facing');
  if (rationale.some(x => /PII High/i.test(x))) tags.add('PII-High');
  if (rationale.some(x => /Data store/i.test(x)) || /db|database|bucket/i.test(lab)) tags.add('Data store');
  return Array.from(tags);
}

function titleCase(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* --- Vertical slider component with dynamic color --- */
function VerticalSlider({ label, value, onChange }) {
  const theme = useTheme();
  const marks = React.useMemo(
    () => [1,2,3,4,5].map(v => ({ value: v, label: String(v) })),
    []
  );
  const color = sliderColor(value, theme);

  return (
    <Stack alignItems="center" sx={{ minWidth: 70 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: .5 }}>{label}</Typography>
      <Slider
        value={value}
        orientation="vertical"
        min={1} max={5} step={1} marks={marks}
        onChange={(_,v)=> onChange(clamp(v))}
        sx={{
          height: 160,
          '& .MuiSlider-thumb, & .MuiSlider-track': { bgcolor: color },
          '& .MuiSlider-rail': { opacity: 0.25 },
        }}
      />
    </Stack>
  );
}

function sliderColor(v, theme) {
  // 1→green … 5→dark red
  const scale = {
    1: '#2e7d32', // green
    2: '#66bb6a', // light green
    3: '#f9a825', // amber
    4: '#c97207ff', // orange
    5: '#c62828', // dark red
  };
  return scale[v] || theme.palette.primary.main;
}
