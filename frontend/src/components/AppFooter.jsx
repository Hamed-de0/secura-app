import * as React from 'react';
import { Box, Toolbar, Typography, Link } from '@mui/material';

export default function AppFooter() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 1 }}>
      <Toolbar variant="dense" sx={{ minHeight: 36, px: 2 }}>
        <Typography variant="caption" sx={{ mr: 2 }}>
          Env: <strong>Demo</strong>
        </Typography>
        <Typography variant="caption">
          Build: <strong>v0.1.0</strong>
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Typography variant="caption" sx={{ mr: 2 }}>Last sync: just now</Typography>
        <Link href="#" underline="hover" variant="caption">Help</Link>
      </Toolbar>
    </Box>
  );
}
