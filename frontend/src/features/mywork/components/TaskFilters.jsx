import * as React from 'react';
import { Stack, TextField, MenuItem, Chip, Box } from '@mui/material';

const TYPES = [
  { id: 'attestation', name: 'Attestation' },
  { id: 'evidence',    name: 'Evidence' },
  { id: 'exception',   name: 'Exception' },
  { id: 'mapping',     name: 'Mapping' },
  { id: 'treatment',   name: 'Treatment' },
];

const STATUSES = [
  { id: 'new', name: 'New' },
  { id: 'in_progress', name: 'In progress' },
  { id: 'blocked', name: 'Blocked' },
  { id: 'overdue', name: 'Overdue' },
  { id: 'done', name: 'Done' },
];

export default function TaskFilters({ q, setQ, type, setType, status, setStatus, total }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        label="Search"
        value={q}
        onChange={(e)=> setQ(e.target.value)}
      />
      <TextField size="small" select label="Type" value={type ?? ''} onChange={(e)=> setType(e.target.value || null)} sx={{ minWidth: 180 }}>
        <MenuItem value="">(Any)</MenuItem>
        {TYPES.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
      </TextField>
      <TextField size="small" select label="Status" value={status ?? ''} onChange={(e)=> setStatus(e.target.value || null)} sx={{ minWidth: 180 }}>
        <MenuItem value="">(Any)</MenuItem>
        {STATUSES.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
      </TextField>
      <Box sx={{ flex: 1 }} />
      <Chip size="small" label={`${total} tasks`} />
    </Stack>
  );
}
