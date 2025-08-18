import React from 'react';
import { List, ListItem, ListItemText, ListItemIcon, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

function iconFor(type) {
  switch (type) {
    case 'assurance_change': return <CheckCircleIcon />;
    case 'evidence_upload': return <UploadFileIcon />;
    case 'mapping_added': return <LinkIcon />;
    case 'risk_update': return <TrendingDownIcon />;
    default: return <CheckCircleIcon />;
  }
}

export default function ActivityList({ items = [], onOpen }) {
  return (
    <List dense sx={{ p: 0 }}>
      {items.map(ev => {
        const primary = (() => {
          if (ev.type === 'assurance_change')
            return `${ev.entity.code} ${ev.entity.title} → ${ev.to}`;
          if (ev.type === 'evidence_upload')
            return `${ev.entity.code} ${ev.entity.title} — uploaded ${ev.file}`;
          if (ev.type === 'mapping_added')
            return `Mapped ${ev.control.code} to ${ev.entity.code} ${ev.entity.title}`;
          if (ev.type === 'risk_update')
            return `Risk "${ev.entity.title}" ${ev.field}: ${ev.from} → ${ev.to}`;
          return ev.type;
        })();

        const secondary = `${new Date(ev.ts).toLocaleString()} · ${ev.user}`;

        return (
          <ListItem key={ev.id} button onClick={() => onOpen?.(ev)}>
            <ListItemIcon>{iconFor(ev.type)}</ListItemIcon>
            <ListItemText primary={primary} secondary={secondary} />
            <Box sx={{ display:'flex', gap: 0.5 }}>
              <Chip size="small" label={ev.type} variant="outlined" />
              <Chip size="small" label={ev.scope} variant="outlined" />
            </Box>
          </ListItem>
        );
      })}
      {items.length === 0 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">No activity found.</Typography>
        </Box>
      )}
    </List>
  );
}
