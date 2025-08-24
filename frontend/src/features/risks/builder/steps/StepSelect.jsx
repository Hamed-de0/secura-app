import * as React from 'react';
import {
  Box, Card, CardContent, Stack, Typography, TextField, InputAdornment, Checkbox, List, ListItem, ListItemIcon, ListItemText, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StepModeSelect from './StepModeSelect';

function FilteredList({ title, items, selected, setSelected }) {
  const [q, setQ] = React.useState('');
  const toggle = (id) => {
    setSelected((arr) => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };
  const filtered = items.filter(i =>
    (i.title || i.label).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
        <TextField
          size="small" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={e=>setQ(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ mb: 1 }}
        />
        <List dense sx={{ maxHeight: 360, overflow: 'auto' }}>
          {filtered.map(it => (
            <ListItem key={it.id} onClick={()=>toggle(it.id)} disablePadding secondaryAction={null}>
              <ListItemIcon>
                <Checkbox edge="start" tabIndex={-1} disableRipple checked={selected.includes(it.id)} />
              </ListItemIcon>
              <ListItemText
                primary={it.title || it.label}
                secondary={it.subtitle || it.type}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItem>
          ))}
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
  

  // Guards – ensure we’re not accidentally feeding scopes into scenarios
  // scenarios usually have title/baseline
  const scenarioItems = Array.isArray(scenarios) ? scenarios.filter(s => s && (s.title || s.baseline)) : [];
  
  // scopes have a type (asset, entity, etc.)
  const scopeItems = Array.isArray(scopes) ? scopes.filter(s => s && s.type) : [];

  const [scopeTab, setScopeTab] = React.useState('asset');
  const scopeOpts = scopeItems.filter(s => s.type === scopeTab);

  // scenarios: we store IDs, so just resolve function updater (if any)
  const handleScenarioIdsChange = React.useCallback((updater) => {
    const nextIds = (typeof updater === 'function')
      ? updater(selectedScenarios)
      : updater;
    setSelectedScenarios(nextIds);
  }, [selectedScenarios, setSelectedScenarios]);

  // Keep a stable array of selected scope IDs
  const selectedScopeIds = React.useMemo(
    () => selectedScopes.map(s => s.id),
    [selectedScopes]
  );
  // Wrapper that supports function updaters OR arrays
  const handleScopeIdsChange = React.useCallback((updater) => {
    const nextIds = typeof updater === 'function'
      ? updater(selectedScopeIds)          // let FilteredList compute the new ids
      : updater;                           // or use the array directly
    // Map ids back to full scope objects (across ALL scopes, not just current tab)
    const nextScopes = scopes.filter(s => nextIds.includes(s.id));
    setSelectedScopes(nextScopes);
  }, [selectedScopeIds, scopes, setSelectedScopes]);

  return (
    <Box sx={{ display:'grid', gap: 2 }}>
      <StepModeSelect mode={mode} onChange={onModeChange} />

      <Box sx={{ display:'grid', gap: 2, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' } }}>
        {(mode === 'scenarioFirst') ? (
          <>
            <FilteredList
              title="Scenarios"
              items={scenarioItems}
              selected={selectedScenarios}           // array of IDs
              setSelected={handleScenarioIdsChange}  // resolves function updater
            />
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Scopes</Typography>
                  <Tabs value={scopeTab} onChange={(_,v)=>setScopeTab(v)} variant="scrollable">
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
                  selected={selectedScopeIds}         // ids for current selection
                  setSelected={handleScopeIdsChange}  // ids -> full objects
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
                  <Tabs value={scopeTab} onChange={(_,v)=>setScopeTab(v)} variant="scrollable">
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
                />
              </CardContent>
            </Card>
            <FilteredList
              title="Scenarios"
              items={scenarioItems}
              selected={selectedScenarios}
              setSelected={handleScenarioIdsChange}
            />
          </>
        )}
      </Box>
    </Box>
  );
}
