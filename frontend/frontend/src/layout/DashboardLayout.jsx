import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: '10px', // same as sidebar width
          marginTop: '64px',   // same as header height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
