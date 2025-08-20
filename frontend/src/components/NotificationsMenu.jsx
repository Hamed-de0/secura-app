import * as React from 'react';
import { Menu, MenuItem, ListItemText, Divider, Button } from '@mui/material';

const MOCKS = [
  { id: 'n1', text: 'Evidence request due in 5 days' },
  { id: 'n2', text: 'Exception EX-08 pending approval' },
  { id: 'n3', text: 'Attestation “Q3 Access Review” is 60% complete' },
];

export default function NotificationsMenu({ anchorEl, onClose }) {
  const [items, setItems] = React.useState(MOCKS);
  const open = Boolean(anchorEl);
  function clear() { setItems([]); onClose?.(); }

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {items.length === 0 && <MenuItem disabled><ListItemText primary="No notifications" /></MenuItem>}
      {items.map((n) => (
        <MenuItem key={n.id} onClick={onClose}>
          <ListItemText primary={n.text} />
        </MenuItem>
      ))}
      <Divider />
      <MenuItem disableRipple disableGutters>
        <Button onClick={clear} size="small" sx={{ mx: 1 }}>Mark all read</Button>
      </MenuItem>
    </Menu>
  );
}
