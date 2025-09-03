import React, {useContext} from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Stack, Button, Tooltip, Chip, Menu, MenuItem, Snackbar
} from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate, Link as RLink, useSearchParams } from 'react-router-dom';
import CommandPalette from '../components/CommandPalette.jsx';
import NotificationsMenu from '../components/NotificationsMenu.jsx';
import {useActions, ACTIONS} from '../features/actions/ActionsProvider.jsx'
import { useTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { ColorModeContext } from '../theme/ColorModeProvider.jsx'; // ← adjust path if needed
import { useI18n } from '../store/i18n/I18nProvider.jsx';
import LangSwitch from '../components/LangSwitch.jsx';
import UserNameBadge from "./UserNameBadge.jsx";

export default function AppHeader({ sidebarCollapsed = false, onToggleSidebar }) {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const location = useLocation();
  const [createEl, setCreateEl] = React.useState(null);
  const [snack, setSnack] = React.useState('');
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [notifEl, setNotifEl] = React.useState(null);
  const actions = useActions();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const theme = useTheme();
  const { tr } = useI18n();

  // preserve scope/version in links
  const scopeQuery = React.useMemo(() => {
    const u = new URLSearchParams();
    const sc = params.get('scope'); const ver = params.get('versions');
    if (sc) u.set('scope', sc);
    if (ver) u.set('versions', ver);
    const s = u.toString();
    return s ? `?${s}` : '';
  }, [location.key]);

  // hotkey: Ctrl/Cmd+K
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function copyShare() {
    try {
      navigator.clipboard.writeText(window.location.href);
      setSnack('Link copied');
    } catch {
      setSnack('Copy failed');
    }
  }

  return (
    <>
      <AppBar elevation={0} color="transparent" position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <IconButton size="small" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
          </IconButton>

          <Typography component={RLink} to="/main-dashboard" variant="subtitle1" color="inherit" sx={{ textDecoration: 'none', mr: 2 }}>
            ISMS / GRC
          </Typography>

          {/* Global Search trigger */}
          <Button
            size="small"
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setPaletteOpen(true)}
            sx={{ minWidth: 280, justifyContent: 'flex-start', color: 'text.secondary', borderStyle: 'dashed' }}
          >
            Search…  <Box component="span" sx={{ ml: 'auto', fontSize: 12, color: 'text.disabled' }}>Ctrl/Cmd K</Box>
          </Button>

          <Box sx={{ flex: 1 }} />

          {/* Scope/version chips (optional — keep or remove if you already show them elsewhere) */}
          {params.get('scope') && <Chip size="small" label={`scope: ${params.get('scope')}`} sx={{ mr: .5 }} />}
          {params.get('versions') && <Chip size="small" label={`versions: ${params.get('versions')}`} sx={{ mr: 1 }} />}

          {/* Actions */}
          <Tooltip title="Create">
            <IconButton size="small" onClick={(e)=> setCreateEl(e.currentTarget)} aria-label="Create">
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy shareable link">
            <IconButton size="small" onClick={copyShare} aria-label="Copy link">
              <LinkIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton size="small" onClick={(e)=> setNotifEl(e.currentTarget)} aria-label="Notifications">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Shortcuts (?)">
            <IconButton size="small" onClick={()=> setPaletteOpen(true)} aria-label="Shortcuts">
              <KeyboardIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton onClick={toggleColorMode} edge="end" aria-label="toggle theme">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          <LangSwitch />
          <UserNameBadge />
        </Toolbar>
      </AppBar>

      {/* Create menu */}
      <Menu anchorEl={createEl} open={Boolean(createEl)} onClose={()=> setCreateEl(null)}>
        <MenuItem onClick={()=> { setCreateEl(null); actions.run(ACTIONS.EXCEPTION_CREATE)}}>Create exception</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); actions.run(ACTIONS.EVIDENCE_UPLOAD, { objectType: 'Control' })}}>Request evidence</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); actions.run(ACTIONS.MAPPING_CONTROL_TO_REQ)}}>Map a Control</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/risk-view${scopeQuery}`); }}>New risk</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/providers${scopeQuery}`); }}>New provider</MenuItem>

        {/* <MenuItem onClick={()=> { setCreateEl(null); nav(`/exceptions${scopeQuery}`); }}>Create exception</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/evidence${scopeQuery}`); }}>Request evidence</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/attestations${scopeQuery}`); }}>New attestation</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/risk-view${scopeQuery}`); }}>New risk</MenuItem>
        <MenuItem onClick={()=> { setCreateEl(null); nav(`/providers${scopeQuery}`); }}>New provider</MenuItem> */}
      </Menu>

      {/* Notifications */}
      <NotificationsMenu anchorEl={notifEl} onClose={()=> setNotifEl(null)} />

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={()=> setPaletteOpen(false)} scopeQuery={scopeQuery} />

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=> setSnack('')} message={snack} />
    </>
  );
}
