import React, { useContext } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Divider,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
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
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LinkIcon from '@mui/icons-material/Link';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TableViewIcon from '@mui/icons-material/TableView';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import SpeedIcon from '@mui/icons-material/Speed';
import { ScopeContext } from '../store/scope/ScopeProvider.jsx';
import { useEffectiveCaps, useMenuCaps } from '../lib/mock/useRbac';
import { useI18n } from '../store/i18n/I18nProvider.jsx';

const COLLAPSED = 72;
const EXPANDED = 240;

const DrawerPaper = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.surface?.rail ?? theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowX: 'hidden',
  transition: theme.transitions.create('width', { duration: 200 }),
  height: '100%',
}));

/** Utilities */
const readOpen = () => {
  try { return JSON.parse(localStorage.getItem('nav:open') || '{}'); } catch { return {}; }
};
const writeOpen = (obj) => {
  try { localStorage.setItem('nav:open', JSON.stringify(obj)); } catch {}
};

/** IA: top-level and grouped items */
const TOP = [
  { label: 'common.overview', icon: <SpeedIcon />, to: '/overview' },
  { label: 'common.myWork', icon: <AssignmentTurnedInIcon />, to: '/my-work' },
  { label: 'Risk Dashboard 1', icon: <AssignmentTurnedInIcon />, to: 'risk-dashboard' },
  { label: 'Risk Dashboard 2', icon: <AssignmentTurnedInIcon />, to: 'risk-dashboard2' },
  
];

const GROUPS = [
  {
    id: 'operate',
    label: 'Operate',
    items: [
      { label: 'Controls', icon: <VerifiedUserIcon />, to: '/controls' },
      {
        label: 'Attestations',
        icon: <FactCheckIcon />,
        to: '/attestations',
        parent: '/controls',
      },
      { label: 'Risks', icon: <WarningAmberIcon />, to: '/risk-view' },
      {
        label: 'Exceptions',
        icon: <ReportGmailerrorredIcon />,
        to: '/exceptions',
        parent: '/risk-view',
      },
      { label: 'Compliance', icon: <RuleIcon />, to: '/compliance/dashboard' },
      {
        label: 'Evidence',
        icon: <UploadFileIcon />,
        to: '/evidence',
        parent: '/compliance',
      },
      {
        label: 'SoA Builder',
        icon: <TableViewIcon />,
        to: '/soa',
        parent: '/compliance',
      },
      { label: 'Providers', icon: <HandshakeIcon />, to: '/providers' },
      { label: 'Assets', icon: <Inventory2Icon />, to: '/assetgroups/tree' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { label: 'Activities', icon: <FactCheckIcon />, to: '/activities' },
      { label: 'Dashboard (legacy)', icon: <SpaceDashboardIcon />, to: '/dashboard' },
      { label: 'Main Dashboard', icon: <SpaceDashboardIcon />, to: '/main-dashboard' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    items: [
      { label: 'Tags', icon: <LocalOfferIcon />, to: '/tags' },
      { label: 'Persons', icon: <GroupIcon />, to: '/persons' },
      { label: 'Settings', icon: <SettingsIcon />, to: '/settings' },
      { label: 'Mapping Manager', icon: <LinkIcon />, to: '/mapping' },
    ],
  },
];

export default function Sidebar() {
  const ui = useContext(UiContext);
  const { sidebarCollapsed } = ui;
  const { pathname } = useLocation();
  const width = sidebarCollapsed ? COLLAPSED : EXPANDED;
  const { t, label } = useI18n();

  // RBAC (kept, but we don't filter by default—flip lines below if needed)
  const { scope } = useContext(ScopeContext);
  const { data: perms } = useEffectiveCaps(scope);
  const { data: menuCaps } = useMenuCaps();
  const isAllowed = (path) => {
    const req = menuCaps[path] || [];
    return req.every((c) => (perms?.caps || []).includes(c));
  };

  // group open/close persisted
  const [openMap, setOpenMap] = React.useState(() => readOpen());
  const toggleGroup = (id) => {
    const next = { ...openMap, [id]: !openMap[id] };
    setOpenMap(next);
    writeOpen(next);
  };

  const onToggleSidebar = React.useCallback(() => {
    if (typeof ui.toggleSidebar === 'function') ui.toggleSidebar();
    else if (typeof ui.setSidebarCollapsed === 'function') ui.setSidebarCollapsed((v) => !v);
    // else: no-op
  }, [ui]);

  const renderLink = (item) => {
    const active =
      item.to === '/'
        ? pathname === '/'
        : pathname === item.to || pathname.startsWith(item.to);

    const content = (
      <ListItemButton
        component={NavLink}
        to={item.to}
        selected={active}
        disabled={false /* flip to !isAllowed(item.to) if you enforce RBAC */}
        sx={{
          px: 1.5,
          minHeight: 44,
          '&.Mui-selected': { bgcolor: (t) => t.palette.action.selected },
        }}
        aria-current={active ? 'page' : undefined}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
          {item.icon}
        </ListItemIcon>
        {!sidebarCollapsed && (
          <ListItemText primary={t(item.label)} primaryTypographyProps={{ noWrap: true }} />
        )}
      </ListItemButton>
    );

    return sidebarCollapsed ? (
      <Tooltip title={t(item.label)} placement="right" arrow enterDelay={600} key={item.to}>
        {content}
      </Tooltip>
    ) : (
      <Box key={item.to}>{content}</Box>
    );
  };

  const renderGroup = (group) => {
    // group "active" if pathname matches any item inside
    const anyActive = group.items.some(
      (i) => pathname === i.to || pathname.startsWith(i.to) || (i.parent && pathname.startsWith(i.parent))
    );
    const isOpen = openMap[group.id] ?? anyActive;

    return (
      <Box key={group.id} sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => toggleGroup(group.id)}
          selected={anyActive && !sidebarCollapsed}
          sx={{
            px: 1.5,
            minHeight: 40,
            '&.Mui-selected': { bgcolor: (t) => t.palette.action.selected },
          }}
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={`grp-${group.id}`}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
            {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemIcon>
          {!sidebarCollapsed && (
            <ListItemText
              primary={group.label}
              primaryTypographyProps={{ variant: 'overline', noWrap: true }}
            />
          )}
        </ListItemButton>
        {/* Children */}
        <Collapse in={!sidebarCollapsed && isOpen} timeout="auto" unmountOnExit>
          <List disablePadding id={`grp-${group.id}`}>
            {/* Show all by default; enforce RBAC with .filter(i => isAllowed(i.to)) if needed */}
            {group.items.map((i) => (
              <Box key={i.to} sx={{ pl: 2 }}>
                {renderLink(i)}
              </Box>
            ))}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      PaperProps={{ component: DrawerPaper, style: { width } }}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width },
      }}
    >
      {/* Header */}
      <Box sx={{ height: 56, display: 'flex', alignItems: 'center', px: 1 }}>
        {!sidebarCollapsed && (
          <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
            ISMS / GRC
          </Typography>
        )}
        <IconButton
          size="small"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          sx={{ ml: sidebarCollapsed ? 0 : 1 }}
        >
          {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>
      </Box>
      <Divider />

      {/* Top links */}
      <List sx={{ py: 0 }}>
        {TOP.map(renderLink)}
      </List>

      <Divider sx={{ my: 0.5 }} />

      {/* Groups */}
      <List sx={{ py: 0 }}>
        {GROUPS.map(renderGroup)}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      {/* Footer (keep legacy quick links if you want) */}
      {/* You can add build/version, org switcher, etc. here later */}
    </Drawer>
  );
}
