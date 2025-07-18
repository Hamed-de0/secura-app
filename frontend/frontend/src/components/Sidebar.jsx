import React from 'react';
import { Drawer, Toolbar, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const Sidebar = () => {

  const navigate = useNavigate();

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
          backgroundColor: '#f5f5f5',
          padding: '10px',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ mt: 2 }}>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
          Dashboard
        </Button>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }} onClick={() => navigate('/assets')}>
          Assets
        </Button>
        <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
          Settings
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
