import React from 'react';
import { Alert, Chip, Stack, Button } from '@mui/material';

export default function MappingDiffBanner({ diff, onReset, onExport }) {
  if (!diff) return null;
  const dirty = (diff.added + diff.removed + diff.changed) > 0;

  return (
    <Alert
      severity={dirty ? 'info' : 'success'}
      sx={{ mb: 1 }}
      action={
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={onExport}>Export JSON</Button>
          <Button size="small" disabled={!dirty} onClick={onReset}>Reset to base</Button>
        </Stack>
      }
    >
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <span>Changes vs. base:</span>
        <Chip size="small" label={`added ${diff.added}`} />
        <Chip size="small" label={`removed ${diff.removed}`} />
        <Chip size="small" label={`changed ${diff.changed}`} />
      </Stack>
    </Alert>
  );
}
