import { Routes, Route, Navigate } from 'react-router-dom'
import MainView from '../layout/MainView'

// Pages
import Dashboard from '../pages/Dashboard'
// import AssetPage from '../features/assets/pages/AssetsPage'
// import ThreatsPage from '../features/threats/pages/ThreatsPage'
// Add others progressively...

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainView><Dashboard /></MainView>} />
      
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
