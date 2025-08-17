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
import TagList from '../features/tags/TagList'
import RiskScenarioTable from '../features/riskScenarios/RiskScenarioTable'
import RiskScenarioForm from '../features/riskScenarios/RiskScenarioForm'
import RiskScenarioEdit from '../features/riskScenarios/RiskScenarioEdit'
import RiskDashboard from '../features/riskScenarios/RiskDashboard'
import RiskScenarioContextView from '../features/RiskScenarioContexts/RiskScenarioContextView'
import AssetTypePage from '../features/assets/assetTypes/AssetTypePage'
import RisksEffectiveView from '../features/dashboards/RiskEffectiveView'
import ISMSDashboard from '../features/dashboards/ISMSDashboard'

// Add others progressively...

function AppRouter() {
  return (
    <Routes>
      {/* <Route path="/" element={<MainView><Dashboard /></MainView>} /> */}
      <Route path="/" element={<MainView><Dashboard /></MainView>} />
      <Route path="/home" element={<MainView><Dashboard /></MainView>} />
      <Route path="/assetgroups/tree" element={<MainView><GroupAssetTreePage /></MainView>} />
      <Route path="/assets/edit/:id" element={<MainView><AssetEditPage /></MainView>} />
      <Route path="/assets/new" element={<MainView><AssetEditPage /></MainView>} />
      <Route path="/asset-types/manage" element={<MainView><AssetTypePage /></MainView>} />
      <Route path="/persons" element={<MainView><PersonPage /></MainView>} />
      <Route path="/threats" element={<MainView><ThreatsPage /></MainView>} />
      <Route path="/vulnerabilities" element={<MainView><VulnerabilitiesPage /></MainView>} />
      <Route path="/relationships/threat-vulnerability" element={<MainView><ThreatVulnerabilityMapPage  /></MainView>} />
      <Route path='/tags' element={<MainView><TagList /></MainView>} />
      <Route path="/risk-scenarios" element={<MainView><RiskScenarioTable /></MainView>} />
      <Route path="/risk-scenarios-context" element={<MainView><RiskScenarioContextView /></MainView>} />
      <Route path="/risk-scenarios/new" element={<MainView><RiskScenarioForm /></MainView>} />
      <Route path="/risk-scenarios/edit/:scenarioId" element={<MainView><RiskScenarioEdit /></MainView>} />
      <Route path="/risk-dashboard" element={<MainView><RiskDashboard /></MainView>} />
      <Route path="/risk-view" element={<MainView><RisksEffectiveView /></MainView>} />

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
