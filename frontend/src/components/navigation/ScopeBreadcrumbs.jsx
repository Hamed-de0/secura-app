import React, { useContext } from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';
import { useScopeParents } from '../../lib/mock/useRbac';
import { getScopeLabel } from '../../lib/mock/rbacClient';

export default function ScopeBreadcrumbs() {
  const { scope, setScope } = useContext(ScopeContext);
  const { data: parents } = useScopeParents(scope);
  const nav = useNavigate();

  if (!parents?.length) return null;

  const onClick = (p) => {
    setScope({ type: p.type, id: p.id });
    // keep current route; URL sync will update ?scope=...
  };

  return (
    <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Breadcrumbs aria-label="scope breadcrumb">
        {parents.slice(0, -1).map((p) => (
          <Link
            key={p.key}
            underline="hover"
            color="text.secondary"
            onClick={() => onClick(p)}
            sx={{ cursor: 'pointer' }}
          >
            {getScopeLabel(p.type, p.id)}
          </Link>
        ))}
        <Typography color="text.primary">
          {getScopeLabel(scope.type, scope.id)}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
}
