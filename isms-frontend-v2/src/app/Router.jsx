import { Routes, Route, Navigate } from 'react-router-dom'
import MainView from '../layout/MainView'

// Pages
import Dashboard from '../pages/Dashboard'
import GroupAssetTreePage from '../features/assets/assetGroups/GroupAssetTreePage'
import AssetEditPage from '../features/assets/assetMain/AssetEditPage'
import PersonPage from '../features/persons/PersonPage'
import ThreatsPage from '../features/threats/ThreatsPage'
import VulnerabilitiesPage from '../features/vulnerabilities/VulnerabilitiesPage'
import ThreatVulnerabilityMapPage from '../features/relationships/threat_vulnerability/ThreatVulnerabilityMapPage'


// Add others progressively...

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainView><Dashboard /></MainView>} />
      <Route path="/assetgroups/tree" element={<MainView><GroupAssetTreePage /></MainView>} />
      <Route path="/assets/edit/:id" element={<MainView><AssetEditPage /></MainView>} />
      <Route path="/persons" element={<MainView><PersonPage /></MainView>} />
      <Route path="/threats" element={<MainView><ThreatsPage /></MainView>} />
      <Route path="/vulnerabilities" element={<MainView><VulnerabilitiesPage /></MainView>} />
      <Route path="/vulnerabilities" element={<MainView><VulnerabilitiesPage /></MainView>} />
      <Route path="/relationships/threat-vulnerability" element={<MainView><ThreatVulnerabilityMapPage  /></MainView>} />
      {/* Future structure - just plug in your page modules */}
      {/* 
      <Route path="/assets" element={<MainView><AssetPage /></MainView>} />
      <Route path="/threats" element={<MainView><ThreatsPage /></MainView>} />
      */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
