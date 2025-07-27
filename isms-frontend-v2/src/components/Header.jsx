import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Header = () => {
  const theme = useTheme();
  return (
    <AppBar position="fixed" style={ {backgroundColor: theme.palette.background.bars}} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          ISMS Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
