import * as React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export default function TabStrip({ value, onChange, tabs }) {
  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Tabs value={value} onChange={(_,v)=> onChange?.(v)} variant="scrollable" scrollButtons="auto">
        {tabs.map(t => <Tab key={t.key} label={t.label} value={t.key} />)}
      </Tabs>
    </Box>
  );
}
