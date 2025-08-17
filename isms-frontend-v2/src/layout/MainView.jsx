import React, { useContext } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ContentView from '../components/ContentView';
import Footer from '../components/Footer';
import { UiContext } from '../store/ui/UiProvider.jsx';

const COLLAPSED = 72;
const EXPANDED = 240;

export default function MainView({ children }) {
  const { sidebarCollapsed } = useContext(UiContext);
  const railWidth = sidebarCollapsed ? COLLAPSED : EXPANDED;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Header />

      {/* Permanent rail lives at root level */}
      <Sidebar />
      
      {/* Main content accounts for rail width AppBar height */}
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)',   // 64px = default Toolbar on desktop
          mt: { xs: '56px', sm: '64px' },    // better across breakpoints
          ml: `${railWidth}px`,              // ← offset by rail width
          transition: (t) => t.transitions.create('margin-left', { duration: 200 }),
          overflow: 'hidden',
        }}
      >
        <ContentView footer={<Footer />} sx={{ flex: 1, width: '100%' }}>
          {children}
        </ContentView>
      </Box>
    </Box>

  )
}


