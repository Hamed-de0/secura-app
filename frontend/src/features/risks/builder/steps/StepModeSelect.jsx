import * as React from 'react';
import { ToggleButton, ToggleButtonGroup, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function StepModeSelect({ mode, onChange }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Choose how you want to start</Typography>
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, v) => v && onChange(v)}
        size="small"
      >
        <ToggleButton value="scenarioFirst"><AutoAwesomeIcon sx={{ mr: .75 }} />Scenario → Scope</ToggleButton>
        <ToggleButton value="scopeFirst"><AccountTreeIcon sx={{ mr: .75 }} />Scope → Scenario</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
