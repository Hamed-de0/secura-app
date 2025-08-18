import { BrowserRouter } from 'react-router-dom'
import Router from './Router'
import ScopeUrlSync from './ScopeUrlSync.jsx';

function App() {
  return (
    <BrowserRouter>
      <ScopeUrlSync />
      <Router />
    </BrowserRouter>
  )
}

export default App
