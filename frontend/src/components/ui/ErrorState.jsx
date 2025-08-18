import React from 'react';
import { Alert, Button, Stack } from '@mui/material';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <Stack sx={{ p: 2 }}>
      <Alert
        severity="error"
        action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Retry</Button> : null}
      >
        {message}
      </Alert>
    </Stack>
  );
}
