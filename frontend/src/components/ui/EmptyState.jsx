import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function EmptyState({
  icon = <InboxIcon />,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  secondary,
  sx,
}) {
  return (
    <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', ...sx }}>
      <Stack spacing={1.5} alignItems="center">
        <Box sx={{ fontSize: 48, opacity: 0.6 }}>
          {icon || <SearchOffIcon />}
        </Box>
        <Typography variant="subtitle1" color="text.primary">{title}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
        {(actionLabel && onAction) && (
          <Button size="small" variant="outlined" onClick={onAction}>{actionLabel}</Button>
        )}
        {secondary}
      </Stack>
    </Box>
  );
}
