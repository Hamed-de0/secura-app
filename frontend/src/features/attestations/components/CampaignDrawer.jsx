import * as React from 'react';
import { Drawer, Box, Stack, Typography, Chip, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DoneAllIcon from '@mui/icons-material/DoneAll';

export default function CampaignDrawer({ open, onClose, campaign }) {
  const s = campaign;
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 2 }}>
        {s && (
          <Stack spacing={1.5}>
            <Typography variant="h6">{s.name}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={s.status} />
              {s.dueDate && <Chip size="small" label={`Due ${s.dueDate}`} />}
              <Chip size="small" label={`${s.controlsCount} controls`} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Scope: {s.scope} • Versions: {s.versions}
            </Typography>
            <Typography variant="body2">Owners: {(s.owners||[]).join(', ')}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button startIcon={<PlayArrowIcon/>} variant="outlined">Open campaign</Button>
              <Button startIcon={<DoneAllIcon/>} variant="text">Mark complete</Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}
