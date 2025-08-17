import React, { useContext, useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';
import { useFrameworkVersions } from '../../lib/mock/useRbac';

export default function VersionChips() {
  const { versions, setVersions } = useContext(ScopeContext);
  const { data: all } = useFrameworkVersions();

  const selected = useMemo(() => new Set(versions || []), [versions]);

  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    // Keep ids sorted for stable URLs
    setVersions(Array.from(s).sort((a,b) => a - b));
  };

  if (!all?.length) return null;

  return (
    <Box sx={{ display:'flex', gap: 0.5, alignItems:'center', mr: 1 }}>
      {all.map(v => (
        <Chip
          key={v.id}
          size="small"
          label={v.code}
          onClick={() => toggle(v.id)}
          color={selected.has(v.id) ? 'primary' : 'default'}
          variant={selected.has(v.id) ? 'filled' : 'outlined'}
        />
      ))}
    </Box>
  );
}
