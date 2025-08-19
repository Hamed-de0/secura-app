import * as React from 'react';
import { Drawer, Box, Stack, Typography, Chip, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function TaskDrawer({ open, onClose, task }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 420, p: 2 }}>
        {task ? (
          <Stack spacing={1.5}>
            <Typography variant="h6">{task.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {task.objectType} {task.objectCode} • {task.scope} • {task.versions}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={task.type} size="small" />
              <Chip label={task.status} size="small" />
              {task.dueDate && <Chip label={`Due ${task.dueDate}`} size="small" />}
              {task.priority && <Chip label={task.priority} size="small" />}
            </Stack>
            {task.details && <Typography variant="body1" sx={{ mt: 1 }}>{task.details}</Typography>}
            {task.link && (
              <Button
                startIcon={<OpenInNewIcon />}
                variant="outlined"
                href={task.link}
              >
                Open linked item
              </Button>
            )}
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
}
