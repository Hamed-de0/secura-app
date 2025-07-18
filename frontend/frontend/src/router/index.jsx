import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import AssetsPage from '../assets/AssetsPage';

const AppRouter = () => (
  <Router>
    <DashboardLayout>
      <Routes>
        <Route path="/assets" element={<AssetsPage />} />
        {/* Add more routes here as needed */}
      </Routes>
    </DashboardLayout>
  </Router>
);

export default AppRouter;
