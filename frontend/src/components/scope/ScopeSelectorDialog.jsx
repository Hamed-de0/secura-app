import React, { useMemo, useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions,
         Button, TextField, MenuItem, Autocomplete, Box, Chip } from '@mui/material';
import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';
import { useScopeSearch } from '../../lib/mock/useRbac';

const TYPES = ['asset','asset_type','asset_group','tag','site','bu','entity','service','org_group'];

export default function ScopeSelectorDialog({ open, onClose }) {
  const { scope, setScope } = useContext(ScopeContext);
  const [type, setType] = useState(scope.type);
  const [query, setQuery] = useState('');
  const { data: results } = useScopeSearch(query, type);
  const selected = useMemo(
    () => results?.find(r => r.id === scope.id && r.type === scope.type) || null,
    [results, scope]
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select scope</DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', gap:2, mt:1 }}>
          <TextField
            select fullWidth label="Type" value={type}
            onChange={(e)=> setType(e.target.value)}
          >
            {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <Autocomplete
            fullWidth
            options={results || []}
            getOptionLabel={(o)=> `${o.label} (${o.type}:${o.id})`}
            value={selected}
            onChange={(_, val)=> val && setScope({ type: val.type, id: val.id })}
            renderInput={(params)=> (
              <TextField {...params} label="Search by name / id"
                onChange={(e)=> setQuery(e.target.value)} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={`${option.label}`} {...getTagProps({ index })} />
              ))
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
