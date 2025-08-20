import * as React from 'react';
import { Dialog, DialogTitle, TextField, List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ITEMS = [
  { label: 'Go to Overview', to: '/main-dashboard' },
  { label: 'Open My Work', to: '/my-work' },
  { label: 'Open Controls', to: '/controls' },
  { label: 'Open Risks', to: '/risk-view' },
  { label: 'Open Compliance', to: '/compliance' },
  { label: 'Open Providers', to: '/providers' },
  { label: 'Open Attestations', to: '/attestations' },
  { label: 'Open Evidence', to: '/evidence' },
  { label: 'Open Exceptions', to: '/exceptions' },
  { label: 'Open SoA Builder', to: '/soa' },
];

export default function CommandPalette({ open, onClose, scopeQuery = '' }) {
  const [q, setQ] = React.useState('');
  const nav = useNavigate();
  React.useEffect(()=> { if (!open) setQ(''); }, [open]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter(i => i.label.toLowerCase().includes(s));
  }, [q]);

  function go(to) {
    onClose?.();
    nav(`${to}${scopeQuery}`);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Search or jump</DialogTitle>
      <TextField
        autoFocus fullWidth placeholder="Type a page or command…"
        value={q} onChange={(e)=> setQ(e.target.value)}
        sx={{ px: 2, pb: 1 }}
      />
      <List dense>
        {filtered.map((i) => (
          <ListItemButton key={i.to} onClick={()=> go(i.to)}>
            <ListItemText primary={i.label} secondary={i.to} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
