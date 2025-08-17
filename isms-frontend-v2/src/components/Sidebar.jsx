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
import {
  Dashboard as DashboardIcon,
  Devices as AssetsIcon,
  ReportProblem as ThreatsIcon,
  BugReport as VulnerabilitiesIcon,
  Security as ControlsIcon,
  Groups as PersonsIcon,
  Insights as AnalysisIcon,
  LocalOffer as TagsIcon,
  AccountTree as RiskScenariosIcon,
  BarChart as ReportsIcon,
  Assessment as RiskAssessmentIcon,
  Settings, ExpandLess, ExpandMore, Tune
} from '@mui/icons-material';
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
  { label: 'Dashboard',  icon: <SpaceDashboardIcon />, to: '/dashboard' },
  { label: 'Compliance', icon: <RuleIcon />,           to: '/compliance/versions/1' }, // adjust default version
  { label: 'Controls',   icon: <VerifiedUserIcon />,   to: '/controls' },
  { label: 'Risks',      icon: <WarningAmberIcon />,   to: '/risk-view' },
  { label: 'Assets',     icon: <Inventory2Icon />,     to: '/assets' },
  { label: 'Providers',  icon: <HandshakeIcon />,      to: '/providers' },
];

const REPORTS = [
  { label: 'Reports', icon: <BarChartIcon />, to: '/reports' },
];

const ADMIN = [
  { label: 'Tags',    icon: <LocalOfferIcon />, to: '/tags' },
  { label: 'Persons', icon: <GroupIcon />,      to: '/persons' },
  { label: 'Settings',icon: <SettingsIcon />,   to: '/settings' },
];


export default function Sidebar() {
  const { sidebarCollapsed } = useContext(UiContext);
  const { pathname } = useLocation();
  const width = sidebarCollapsed ? COLLAPSED : EXPANDED;

  const renderItem = (item) => {
    const active = pathname.startsWith(item.to);
    const content = (
      <ListItemButton
        component={NavLink}
        to={item.to}
        selected={active}
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
    return sidebarCollapsed
      ? (
        <Tooltip title={item.label} placement="right" arrow enterDelay={600} key={item.to}>
          {content}
        </Tooltip>
      ) : <Box key={item.to}>{content}</Box>;
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
      <List sx={{ py: 0 }}>{NAV_ITEMS.map(renderItem)}</List>
      <Divider sx={{ my: 0.5 }} />
      <List sx={{ py: 0 }}>{REPORTS.map(renderItem)}</List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List sx={{ py: 0, mb: 1 }}>{ADMIN.map(renderItem)}</List>
    </Drawer>
  );
}

