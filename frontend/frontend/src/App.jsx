import React from 'react';
import DashboardLayout from './layout/DashboardLayout';
import Home from './pages/Home';

const App = () => {
  return (
    <DashboardLayout>
      <Home />
    </DashboardLayout>
  );
};

export default App;
