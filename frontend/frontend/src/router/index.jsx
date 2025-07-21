import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import AssetView from '../assets/AssetView';
import AssetTypePage from '../assets/assetTypes/AssetTypePage';
import AssetGroupPage from '../assets/assetGroups/AssetGroupPage';
import GroupAssetTreePage from '../assets/assetGroups/GroupAssetTreePage';
import NewAssetBlock from '../assets/NewAssetBlock';
import AssetEditPage from '../assets/AssetEditPage';
import PersonPage from '../persons/PersonPage';

import Home from '../pages/Home';

const AppRouter = () => (
  <Router>
    <DashboardLayout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/assets" element={<AssetView />} />
        <Route path="/assetgroups/tree" element={<GroupAssetTreePage />} />
        <Route path="/assets/new" element={<NewAssetBlock />} />
        <Route path="/assets/edit/:id" element={<AssetEditPage />} />

        <Route path="/persons" element={<PersonPage />} />

        <Route path="/settings/asset-types" element={<AssetTypePage />} />
        <Route path="/settings/asset-groups" element={<AssetGroupPage />} />
      </Routes>
    </DashboardLayout>
  </Router>
);

export default AppRouter;
