import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, TextField, MenuItem, Divider } from '@mui/material';
import { searchPersons } from '../../../../api/services/people';

export default function StepGovern({
  rows, setRows,
  owners, ownerId, setOwnerId,
  nextReview, setNextReview
}) {
  const applyOwner = (id) => setRows(prev => prev.map(r => ({ ...r, ownerId: id })));
  const applyReview = (date) => setRows(prev => prev.map(r => ({ ...r, nextReview: date })));

  // Load owners if not provided
  const [ownerOptions, setOwnerOptions] = React.useState(Array.isArray(owners) && owners.length ? owners : []);
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (Array.isArray(owners) && owners.length) {
        setOwnerOptions(owners);
        return;
      }
      try {
        const res = await searchPersons({ limit: 200 });
        if (!alive) return;
        setOwnerOptions((res?.items || []).map(p => ({ id: p.id, name: p.displayName })));
      } catch {
        // ignore; keep empty list
      }
    })();
    return () => { alive = false; };
  }, [owners]);

  const handleRowOwner = (rowId, value) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, ownerId: value || null } : r));
  };

  return (
    <Box sx={{ display:'grid', gap: 2, gridTemplateColumns:{ xs:'1fr', md:'1fr 1fr' } }}>
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Ownership</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              select size="small" label="Owner"
              value={ownerId || ''}
              onChange={(e)=>{ setOwnerId(e.target.value || null); applyOwner(e.target.value || null); }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {ownerOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
            </TextField>
          </Stack>
          <Typography variant="caption" color="text.secondary">Applied to all candidates.</Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Review cadence</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small" type="date" label="Next review"
              value={nextReview || ''}
              onChange={(e)=>{ setNextReview(e.target.value || null); applyReview(e.target.value || null); }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 220 }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">Suggested by severity in a later iteration.</Typography>
        </CardContent>
      </Card>

      {/* Optional per-row overrides */}
      <Card sx={{ gridColumn: '1 / -1', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Per-row owner overrides (optional)</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 1, maxHeight: 360, overflowY: 'auto' }}>
            {rows.map(r => (
              <React.Fragment key={r.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                  <Typography variant="body2" noWrap title={`${r.scenarioTitle} — ${r.scopeLabel}`}>
                    {r.scenarioTitle} — {r.scopeLabel}
                  </Typography>
                </Box>
                <Box>
                  <TextField
                    select size="small" fullWidth label="Owner (override)"
                    value={r.ownerId || ''}
                    onChange={(e)=> handleRowOwner(r.id, e.target.value)}
                  >
                    <MenuItem value="">(Use global)</MenuItem>
                    {ownerOptions.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                  </TextField>
                </Box>
              </React.Fragment>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">Leave blank to inherit the global owner above.</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
