import { Routes, Route, Navigate } from 'react-router-dom'
import MainView from '../layout/MainView'
import RequireCaps from './RequireCaps.jsx';
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
// import MainDashboard from '../features/dashboards/MainDashboard.jsx';
import ComplianceExplorer from '../features/compliance/pages/ComplianceExplorer.jsx';
import ControlsAtScope from '../features/controls/pages/ControlsAtScope.jsx';
import RiskView from '../features/risks/pages/RiskView.jsx';
import ProvidersPage from '../features/providers/pages/ProvidersPage.jsx';
import ActivitiesPage from '../features/activities/pages/ActivitiesPage.jsx';
import MappingManager from '../features/mapping/pages/MappingManager.jsx';
import MyWork from '../features/mywork/pages/MyWork.jsx';
import Attestations from '../features/attestations/pages/Attestations.jsx';
import EvidenceInbox from '../features/evidence/pages/EvidenceInbox.jsx';
import Exceptions from '../features/exceptions/pages/Exceptions.jsx';
import Providers from '../features/providers/pages/Providers.jsx';
import Reporting from '../features/reporting/pages/Reporting.jsx';
import SoABuilder from '../features/soa/pages/SoABuilder.jsx';
import MainDashboard from '../features/dashboards/pages/MainDashboard.jsx';
import ComplianceDashboard from '../features/compliance/pages/ComplianceDashboard.jsx';
import ComplianceDashboardMulti from '../features/compliance/pages/ComplianceDashboardMulti.jsx';
import ControlsDashboard from '../features/controls/pages/ControlsDashboard.jsx';


// Add others progressively...

function AppRouter() {
  return (
    <Routes>

      {/* <Route path="/" element={<MainView><Dashboard /></MainView>} /> */}
      <Route path="/" element={<MainView><Dashboard /></MainView>} />
      <Route path="/main-dashboard" element={<MainView><Dashboard /></MainView>} />
      <Route path="/overview" element={<MainView><MainDashboard /></MainView>} />
      <Route path="/dashboard" element={<MainView><ISMSDashboard /></MainView>} />
      {/* <Route path="/compliance/versions/:versionId" element={<MainView><ComplianceExplorer /></MainView>} /> */}
      <Route path="/compliance/versions/:versionId" element={<MainView><ComplianceDashboard /></MainView>} />
      <Route path="/compliance/dashboard" element={<MainView><ComplianceDashboardMulti /></MainView>} />
      <Route path="/assetgroups/tree" element={<MainView><GroupAssetTreePage /></MainView>} />
      <Route path="/assets/edit/:id" element={<MainView><AssetEditPage /></MainView>} />
      <Route path="/assets/new" element={<MainView><AssetEditPage /></MainView>} />
      {/* <Route path="/asset-types/manage" element={<MainView><AssetTypePage /></MainView>} /> */}
      {/* <Route path="/persons" element={<MainView><PersonPage /></MainView>} /> */}
      <Route path="/threats" element={<MainView><ThreatsPage /></MainView>} />
      <Route path="/vulnerabilities" element={<MainView><VulnerabilitiesPage /></MainView>} />
      <Route path="/relationships/threat-vulnerability" element={<MainView><ThreatVulnerabilityMapPage /></MainView>} />
      <Route path='/tags' element={<MainView><TagList /></MainView>} />
      <Route path="/risk-scenarios" element={<MainView><RiskScenarioTable /></MainView>} />
      <Route path="/risk-scenarios-context" element={<MainView><RiskScenarioContextView /></MainView>} />
      <Route path="/risk-scenarios/new" element={<MainView><RiskScenarioForm /></MainView>} />
      <Route path="/risk-scenarios/edit/:scenarioId" element={<MainView><RiskScenarioEdit /></MainView>} />
      {/* <Route path="/risk-dashboard" element={<MainView><RiskDashboard /></MainView>} /> */}
      {/* <Route path="/risk-view" element={<MainView><RisksEffectiveView /></MainView>} /> */}
      <Route path="/risk-view" element={<MainView><RiskView /></MainView>} />
      {/* <Route path="/controls" element={<MainView><ControlsAtScope /></MainView>} /> */}
      <Route path="/controls" element={<MainView><ControlsDashboard /></MainView>} />
      <Route path="/providers" element={<MainView><ProvidersPage /></MainView>} />
      <Route path="/activities" element={<MainView><ActivitiesPage /></MainView>} />
      <Route path="/my-work" element={<MainView><MyWork /></MainView>} />
    
      <Route path="/attestations" element={<MainView><Attestations /></MainView>} />
      <Route path="/evidence" element={<MainView><EvidenceInbox /></MainView>} />
      <Route path="/exceptions" element={<MainView><Exceptions /></MainView>} />
      <Route path="/providers" element={<MainView><Providers /></MainView>} />
      <Route path="/reporting" element={<MainView><Reporting /></MainView>} />
      <Route path="/soa" element={<MainView><SoABuilder /></MainView>} />

      <Route path="/persons" element={
        <RequireCaps caps={['manage_org']}>
          <MainView><PersonPage /></MainView>
        </RequireCaps>
      } />

      <Route path="/asset-types/manage" element={
        <RequireCaps caps={['manage_org']}>
          <MainView><AssetTypePage /></MainView>
        </RequireCaps>
      } />

      <Route path="/risk-dashboard" element={
        <RequireCaps caps={['view_reports']}>
          <MainView><RiskDashboard /></MainView>
        </RequireCaps>
      } />

      <Route
        path="/mapping"
        element={
          <RequireCaps caps={['manage_mappings']}>
            <MainView><MappingManager /></MainView>
          </RequireCaps>
        }
      />

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
