import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, TextField, InputAdornment, Checkbox,
  List, ListItem, ListItemIcon, ListItemText, Tabs, Tab, Tooltip, Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import StepModeSelect from './StepModeSelect';

/* Tooltip only when text is actually truncated */
function OverflowTooltip({ children, title }) {
  const ref = React.useRef(null);
  const [overflow, setOverflow] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () =>
      setOverflow(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, title]);

  const content = (
    <Box
      ref={ref}
      sx={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
  return overflow ? <Tooltip title={title} enterDelay={400}>{content}</Tooltip> : content;
}

/* Reusable filtered list (supports preview on hover/click) */
function FilteredList({ title, items, selected, setSelected, kind, onPreview }) {
  const [q, setQ] = React.useState('');
  const toggle = (id, item) => {
    setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
    onPreview?.({ kind, item });
  };
  const filtered = items.filter((i) =>
    (i.title || i.label || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        {title !== '' && <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>}
        <TextField
          size="small"
          placeholder={`Search ${title ? title.toLowerCase() : 'items'}…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
          {filtered.map((it) => {
            const primary = it.title || it.label || '';
            const secondary = it.subtitle || it.type || '';
            return (
              <ListItem
                key={it.id}
                onClick={() => toggle(it.id, it)}
                onMouseEnter={() => onPreview?.({ kind, item: it })}
                disablePadding
              >
                <ListItemIcon>
                  <Checkbox edge="start" tabIndex={-1} disableRipple checked={selected.includes(it.id)} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <OverflowTooltip title={primary}>
                      <Typography variant="body2">{primary}</Typography>
                    </OverflowTooltip>
                  }
                  secondary={
                    secondary ? (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {secondary}
                      </Typography>
                    ) : null
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}

export default function StepSelect({
  mode, onModeChange,
  scenarios, scopes,
  selectedScenarios, setSelectedScenarios,
  selectedScopes, setSelectedScopes,
}) {
  // Ensure shapes
  const scenarioItems = Array.isArray(scenarios)
    ? scenarios.filter((s) => s && (s.title || s.baseline))
    : [];
  const scopeItems = Array.isArray(scopes)
    ? scopes.filter((s) => s && s.type)
    : [];

  const [scopeTab, setScopeTab] = React.useState('asset');
  const scopeOpts = scopeItems.filter((s) => s.type === scopeTab);

  // Selected IDs handlers (support setter functions)
  const handleScenarioIdsChange = React.useCallback(
    (updater) => {
      const nextIds = typeof updater === 'function' ? updater(selectedScenarios) : updater;
      setSelectedScenarios(nextIds);
    },
    [selectedScenarios, setSelectedScenarios]
  );

  const selectedScopeIds = React.useMemo(() => selectedScopes.map((s) => s.id), [selectedScopes]);

  const handleScopeIdsChange = React.useCallback(
    (updater) => {
      const nextIds = typeof updater === 'function' ? updater(selectedScopeIds) : updater;
      const byId = new Map(scopes.map((s) => [s.id, s]));
      const nextScopes = nextIds.map((id) => byId.get(id)).filter(Boolean);
      setSelectedScopes(nextScopes);
    },
    [selectedScopeIds, scopes, setSelectedScopes]
  );

  // Preview state (sticky panel updates on hover/selection)
  const [preview, setPreview] = React.useState(null); // { kind:'scenario'|'scope', item:{} }
  const handlePreview = React.useCallback((payload) => setPreview(payload || null), []);

  const renderPreview = () => {
    if (!preview) {
      return (
        <Typography color="text.secondary">
          Hover or select a Scenario or a Scope to see details here.
        </Typography>
      );
    }
    if (preview.kind === 'scenario') {
      const s = preview.item || {};
      const tags = s.tags || [];
      return (
        <>
          <Typography variant="subtitle1" gutterBottom>{s.title || 'Scenario'}</Typography>
          {s.description && (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{s.description}</Typography>
          )}
          {!!tags.length && (
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {tags.map((t) => <Chip key={t} size="small" label={t} />)}
            </Stack>
          )}
          {s.baseline && (s.baseline.likelihood || s.baseline.impacts) && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {s.baseline.likelihood != null && <Chip size="small" label={`L ${s.baseline.likelihood}`} />}
              {s.baseline.impacts && Object.entries(s.baseline.impacts).map(([k, v]) => (
                <Chip key={k} size="small" label={`${k} ${v}`} />
              ))}
            </Stack>
          )}
        </>
      );
    }
    const sc = preview.item || {};
    return (
      <>
        <Typography variant="subtitle1" gutterBottom>{sc.label || 'Scope'}</Typography>
        {sc.type && <Typography variant="body2" color="text.secondary">{sc.type}</Typography>}
      </>
    );
  };

  return (
    // grid container: let content scroll; sticky preview will pin to bottom of this scroll area
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridAutoRows: 'max-content',
        alignContent: 'start',
        minHeight: 0, // important so sticky works inside drawer scroll area
      }}
    >
      <StepModeSelect mode={mode} onChange={onModeChange} />

      {/* Two-column pickers */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, minHeight: 0 }}>
        {mode === 'scenarioFirst' ? (
          <>
            <FilteredList
              title="Scenarios"
              items={scenarioItems}
              selected={selectedScenarios}
              setSelected={handleScenarioIdsChange}
              kind="scenario"
              onPreview={handlePreview}
            />
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Scopes</Typography>
                  <Tabs value={scopeTab} onChange={(_, v) => setScopeTab(v)} variant="scrollable">
                    <Tab value="asset" label="Assets" />
                    <Tab value="asset_type" label="Types" />
                    <Tab value="group" label="Groups" />
                    <Tab value="entity" label="Entities" />
                    <Tab value="provider" label="Providers" />
                  </Tabs>
                </Stack>
                <FilteredList
                  title=""
                  items={scopeOpts}
                  selected={selectedScopeIds}
                  setSelected={handleScopeIdsChange}
                  kind="scope"
                  onPreview={handlePreview}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Scopes</Typography>
                  <Tabs value={scopeTab} onChange={(_, v) => setScopeTab(v)} variant="scrollable">
                    <Tab value="asset" label="Assets" />
                    <Tab value="asset_type" label="Types" />
                    <Tab value="group" label="Groups" />
                    <Tab value="entity" label="Entities" />
                    <Tab value="provider" label="Providers" />
                  </Tabs>
                </Stack>
                <FilteredList
                  title=""
                  items={scopeOpts}
                  selected={selectedScopeIds}
                  setSelected={handleScopeIdsChange}
                  kind="scope"
                  onPreview={handlePreview}
                />
              </CardContent>
            </Card>
            <FilteredList
              title="Scenarios"
              items={scenarioItems}
              selected={selectedScenarios}
              setSelected={handleScenarioIdsChange}
              kind="scenario"
              onPreview={handlePreview}
            />
          </>
        )}
      </Box>

      {/* Sticky Preview (docks above drawer footer) */}
      <Box
        sx={(theme) => ({
          position: 'sticky',
          bottom: 0,
          zIndex: 3,
          pt: 1,
          // subtle fade so it feels attached to bottom
          background: `linear-gradient(to top, ${theme.palette.background.default} 70%, ${alpha(
            theme.palette.background.default,
            0
          )} 100%)`,
        })}
      >
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ maxHeight: 180, overflow: 'auto' }}>
            {renderPreview()}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
