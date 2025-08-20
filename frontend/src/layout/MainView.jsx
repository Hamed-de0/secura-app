import React, { useContext } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ContentView from '../components/ContentView';
import Footer from '../components/Footer';
import { UiContext } from '../store/ui/UiProvider.jsx';
import ScopeBreadcrumbs from '../components/navigation/ScopeBreadcrumbs';
import AppFooter from '../components/AppFooter.jsx';
import AppHeader from '../components/AppHeader.jsx';

const COLLAPSED = 72;
const EXPANDED = 240;

export default function MainView({ children }) {
  const { sidebarCollapsed } = useContext(UiContext);
  const railWidth = sidebarCollapsed ? COLLAPSED : EXPANDED;
  const ui = React.useContext(UiContext);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar /> {/* your existing sidebar */}
      <Box sx={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader
          sidebarCollapsed={ui.sidebarCollapsed}
          onToggleSidebar={ui.toggleSidebar}
        />
        <Box component="main" sx={{ p: 2, flex: 1 }}>
          <ContentView sx={{ flex: 1, width: '100%' }}>
          {children}
        </ContentView>
        </Box>
        <AppFooter />
      </Box>
    </Box>
  );
  /*
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

      
      <Sidebar />
      
      
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
        <ScopeBreadcrumbs />
        <ContentView footer={<Footer />} sx={{ flex: 1, width: '100%' }}>
          {children}
        </ContentView>
      </Box>
    </Box>

  ) 
  */
}


