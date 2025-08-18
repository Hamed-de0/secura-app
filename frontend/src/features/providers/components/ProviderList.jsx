import React from 'react';
import { List, ListItemButton, ListItemText, Box, Typography } from '@mui/material';

export default function ProviderList({ items = [], selectedId, onSelect }) {
  return (
    <Box sx={{ p: 1, borderRight: 1, borderColor: 'divider', height: '100%', overflow: 'auto' }}>
      <Typography variant="subtitle2" sx={{ px: 1, pb: 1 }}>Services</Typography>
      <List dense disablePadding>
        {(items || []).map(s => (
          <ListItemButton
            key={s.id}
            selected={s.id === selectedId}
            onClick={() => onSelect?.(s.id)}
          >
            <ListItemText
              primary={s.name}
              secondary={s.provider}
              primaryTypographyProps={{ noWrap: true }}
              secondaryTypographyProps={{ noWrap: true }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
