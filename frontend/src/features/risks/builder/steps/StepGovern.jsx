import * as React from 'react';
import { Box, Card, CardContent, Stack, Typography, TextField, MenuItem } from '@mui/material';

export default function StepGovern({
  rows, setRows,
  owners, ownerId, setOwnerId,
  nextReview, setNextReview
}) {
  const applyOwner = (id) => setRows(prev => prev.map(r => ({ ...r, ownerId: id })));
  const applyReview = (date) => setRows(prev => prev.map(r => ({ ...r, nextReview: date })));

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
              {owners.map(o => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
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
    </Box>
  );
}
