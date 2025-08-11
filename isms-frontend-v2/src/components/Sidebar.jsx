import React, { useState } from 'react';
import {
  Drawer, Toolbar, Box, IconButton, Tooltip, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, Collapse
} from '@mui/material';
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

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { icon: <DashboardIcon color="primary" />, label: 'Dashboard', route: '/home' },
    { icon: <AssetsIcon color="info" />, label: 'Assets', route: '/assetgroups/tree' },
    { icon: <ThreatsIcon color="error" />, label: 'Threats', route: '/threats' },
    { icon: <VulnerabilitiesIcon color="warning" />, label: 'Vulnerabilities', route: '/vulnerabilities' },
    { icon: <ControlsIcon color="success" />, label: 'Controls', route: '/controls' },
    { icon: <PersonsIcon color="secondary" />, label: 'Persons', route: '/persons' },
    { icon: <AnalysisIcon color="action" />, label: 'Analysis', route: '/risk-dashboard' },
    { icon: <TagsIcon color="default" />, label: 'Tags', route: '/tags' },
    { icon: <RiskScenariosIcon color="primary" />, label: 'Risk Scenarios', route: '/risk-scenarios' },
    { icon: <RiskAssessmentIcon color="primary" />, label: 'Risk Contexts', route: '/risk-scenarios-context' },
    { icon: <ReportsIcon color="secondary" />, label: 'Reports', route: '/risk-view' },
  ];


  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? 70 : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? 70 : drawerWidth,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          p: 1,
        },
      }}
    >
      <Toolbar />
      <Box display="flex" justifyContent="center" mb={2}>
        <IconButton onClick={() => setCollapsed(!collapsed)}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List>
        {menuItems.map((item) => (
          <Tooltip key={item.label} title={collapsed ? item.label : ''} placement="right">
            <ListItemButton onClick={() => navigate(item.route)} sx={{ px: 2 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>{item.icon}</ListItemIcon>
              {!collapsed && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Tooltip title={collapsed ? 'Settings' : ''} placement="right">
        <ListItemButton onClick={() => setSettingsOpen(!settingsOpen)} sx={{ px: 2 }}>
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 2 }}>
            <Settings />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Settings" />}
          {!collapsed && (settingsOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip>

      <Collapse in={settingsOpen && !collapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/settings/asset-types')}>
            <ListItemIcon><Tune /></ListItemIcon>
            <ListItemText primary="Asset Types" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/settings/asset-groups')}>
            <ListItemIcon><Tune /></ListItemIcon>
            <ListItemText primary="Asset Groups" />
          </ListItemButton>
        </List>
      </Collapse>
    </Drawer>
  );
};

export default Sidebar;
