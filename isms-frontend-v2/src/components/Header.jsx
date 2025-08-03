import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Header = () => {
  const theme = useTheme();
  return (
    <AppBar position="fixed" style={ {backgroundColor: theme.palette.background.bars}} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" style={{ color: theme.palette.text.primary }}>
          ISMS Dashboard - H&H Communication Lab GmbH
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
