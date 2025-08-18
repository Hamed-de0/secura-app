import React, { useContext, useMemo } from 'react';
import { Alert, Box } from '@mui/material';
import { ScopeContext } from '../store/scope/ScopeProvider.jsx';
import { useEffectiveCaps } from '../lib/mock/useRbac';

export default function RequireCaps({ caps = [], children }) {
  const { scope } = useContext(ScopeContext);
  const { data: perms } = useEffectiveCaps(scope);

  const allowed = useMemo(() => {
    const userCaps = new Set(perms?.caps || []);
    return caps.every(c => userCaps.has(c));
  }, [perms?.caps, caps]);

  if (allowed) return children;

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="warning">
        You don’t have permission to view this page at the current scope.
        Required: <b>{caps.join(', ')}</b>.
      </Alert>
    </Box>
  );
}
