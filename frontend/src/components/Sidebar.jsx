import React, { useContext } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { UiContext } from '../store/ui/UiProvider.jsx';
import { NavLink, useLocation } from 'react-router-dom';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import RuleIcon from '@mui/icons-material/Rule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BarChartIcon from '@mui/icons-material/BarChart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import { ScopeContext } from '../store/scope/ScopeProvider.jsx';
import { useEffectiveCaps, useMenuCaps } from '../lib/mock/useRbac';
import BugReportIcon from '@mui/icons-material/BugReport';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';

const COLLAPSED = 72;
const EXPANDED = 240;

const DrawerPaper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.surface?.rail ?? theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowX: 'hidden',
  transition: theme.transitions.create('width', { duration: 200 }),
  height: '100%',
}));

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <SpaceDashboardIcon />, to: '/dashboard' },
  { label: 'Compliance', icon: <RuleIcon />, to: '/compliance/versions/1' }, // adjust default version
  { label: 'Controls', icon: <VerifiedUserIcon />, to: '/controls' },
  { label: 'Risks', icon: <WarningAmberIcon />, to: '/risk-view' },
  { label: 'Assets', icon: <Inventory2Icon />, to: '/assetgroups/tree' },
  { label: 'Providers', icon: <HandshakeIcon />, to: '/providers' },
];

const REPORTS = [
  { label: 'Reports', icon: <BarChartIcon />, to: '/main-dashboard' },
];

const ADMIN = [
  { label: 'Tags', icon: <LocalOfferIcon />, to: '/tags' },
  { label: 'Persons', icon: <GroupIcon />, to: '/persons' },
  { label: 'Settings', icon: <SettingsIcon />, to: '/settings' },
];


export default function Sidebar() {
  const { sidebarCollapsed } = useContext(UiContext);
  const { pathname } = useLocation();
  const width = sidebarCollapsed ? COLLAPSED : EXPANDED;
  const { scope } = useContext(ScopeContext);
  const { data: perms } = useEffectiveCaps(scope);
  const { data: menuCaps } = useMenuCaps();
  const isAllowed = (path) => {
    const req = menuCaps[path] || [];
    return req.every(c => (perms?.caps || []).includes(c));
  };

  const renderItem = (item) => {
    const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
    const req = menuCaps[item.to] || [];
    const userCaps = new Set(perms?.caps || []);
    const missing = req.filter(c => !userCaps.has(c));
    const allowed = missing.length === 0;

    const content = (
      <ListItemButton
        component={NavLink}
        to={item.to}
        selected={active}
        disabled={!allowed}
        sx={{
          px: 1.5,
          minHeight: 44,
          '&.Mui-selected': {
            bgcolor: (t) => t.palette.action.selected,
          },
        }}
        aria-current={active ? 'page' : undefined}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
          {item.icon}
        </ListItemIcon>
        {!sidebarCollapsed && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ noWrap: true }}
          />
        )}
      </ListItemButton>
    );

    const tip = !allowed
      ? `Requires: ${missing.join(', ')}`
      : item.label;

    return sidebarCollapsed
      ? (<Tooltip title={tip} placement="right" arrow enterDelay={600} key={item.to}>{content}</Tooltip>)
      : (!allowed
        ? <Tooltip title={tip} key={item.to}>{content}</Tooltip>
        : <Box key={item.to}>{content}</Box>);
  };

  return (
    <Drawer
      variant="permanent"
      PaperProps={{ component: DrawerPaper, style: { width } }}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width }, // ensure width applies
      }}
    >
      {/* Optional logo / app label */}
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 1.5 }}>
        {!sidebarCollapsed && <Typography variant="subtitle2" noWrap>ISMS / GRC</Typography>}
      </Box>
      <Divider />
      {/* <List sx={{ py: 0 }}>{NAV_ITEMS.filter(i => isAllowed(i.to)).map(renderItem)}</List> */}
      <List sx={{ py: 0 }}>{NAV_ITEMS.map(renderItem)}</List>
      <Divider sx={{ my: 0.5 }} />
      {/* <List sx={{ py: 0 }}>{REPORTS.filter(i => isAllowed(i.to)).map(renderItem)}</List> */}
      <List sx={{ py: 0 }}>{REPORTS.map(renderItem)}</List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      {/* <List sx={{ py: 0, mb: 1 }}>{ADMIN.filter(i => isAllowed(i.to)).map(renderItem)}</List> */}
      <List sx={{ py: 0, mb: 1 }}>{ADMIN.map(renderItem)}</List>
    </Drawer>
  );
}

