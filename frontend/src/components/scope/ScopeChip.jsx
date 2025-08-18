import React, { useContext, useState } from 'react';
import { Chip } from '@mui/material';
import { ScopeContext } from '../../store/scope/ScopeProvider.jsx';
import ScopeSelectorDialog from './ScopeSelectorDialog.jsx';
import { getScopeLabel } from '../../lib/mock/rbacClient';

export default function ScopeChip() {
  const { scope } = useContext(ScopeContext);
  const [open, setOpen] = useState(false);
  const label = getScopeLabel(scope.type, scope.id);

  return (
    <>
      <Chip
        variant="outlined"
        size="small"
        label={`${scope.type}: ${label}`}
        onClick={()=> setOpen(true)}
        sx={{ mr: 1 }}
      />
      <ScopeSelectorDialog open={open} onClose={()=> setOpen(false)} />
    </>
  );
}
