import React, { useContext } from 'react';
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, IconButton, Tooltip, Box, Chip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from '../theme/ColorModeProvider.jsx'; // ← adjust path if needed
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { UiContext } from '../store/ui/UiProvider.jsx';

import { ScopeContext } from '../store/scope/ScopeProvider.jsx';
import { useEffectiveCaps } from '../lib/mock/useRbac';
import ScopeChip from './scope/ScopeChip.jsx';
import VersionChips from './version/VersionChips.jsx';

const Header = () => {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const { sidebarCollapsed, toggleSidebar } = useContext(UiContext);

  const { scope } = useContext(ScopeContext);
  const { data: perms } = useEffectiveCaps(scope);


  return (
    // <AppBar position="fixed" style={ {backgroundColor: theme.palette.background.bars}} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <AppBar
      color='default'
      position="fixed"
      sx={{
        backgroundColor: (t) => t.palette.surface?.header ?? t.palette.background.paper,
        zIndex: (t) => t.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <IconButton onClick={toggleSidebar} edge="start" sx={{ mr: 1 }} aria-label="toggle sidebar">
          {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
        <Typography variant="h6" noWrap component="div" >
          ISMS Dashboard - H&H Communication Lab GmbH
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <ScopeChip />
        <VersionChips />
        <Chip
          size="small"
          label={perms?.effective_role || 'Viewer'}
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          <IconButton onClick={toggleColorMode} edge="end" aria-label="toggle theme">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
