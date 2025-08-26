import * as React from 'react';
import { Autocomplete, TextField, Avatar, Stack, CircularProgress } from '@mui/material';
import { searchPersons } from '../../../api/services/people';

export default function OwnerPicker({ value, onChange, autoFocus=false, size='small', placeholder='Assign owner…' }) {
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const res = await searchPersons({ q, limit: 20 });
      if (!alive) return;
      setOptions(res.items);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [q]);

  return (
    <Autocomplete
      size={size}
      options={options}
      loading={loading}
      value={value || null}
      onChange={(_, v) => onChange?.(v || null)}
      isOptionEqualToValue={(o, v) => o?.id === v?.id}
      getOptionLabel={(o) => o?.displayName || ''}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 24, height: 24 }}>{option.initials}</Avatar>
            <span>{option.displayName}</span>
            <span style={{ opacity:.6, marginLeft:8, fontSize:12 }}>{option.email}</span>
          </Stack>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          onChange={(e)=> setQ(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          autoFocus={autoFocus}
        />
      )}
    />
  );
}
