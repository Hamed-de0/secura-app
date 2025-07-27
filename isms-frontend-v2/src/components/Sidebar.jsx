import React, { useState } from 'react';
import { Drawer, Toolbar, Box, Button, Collapse } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTheme } from '@mui/material'


const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          padding: '10px',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ mt: 2 }}>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/home')}>
          Dashboard
        </Button>

        <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/assets')}>
          Assets
        </Button>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/assetgroups/tree')}>
          Asset Groups
        </Button>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/persons')}>
          Persons
        </Button>

        {/* Settings toggle */}
        <Button
          fullWidth
          variant="outlined"
          endIcon={settingsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setSettingsOpen(!settingsOpen)}
          sx={{ mb: 1 }}
        >
          Settings
        </Button>

        {/* Collapsible settings links */}
        <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/settings/asset-types')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Asset Types
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/settings/asset-groups')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Asset Groups
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
