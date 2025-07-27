import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ContentView from '../components/ContentView'
import Footer from '../components/Footer'

const MainView = ({ children }) => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex',  backgroundColor: '#e5f57dff' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden',marginTop: '64px' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',  width: '100%', }}>
          <ContentView>{children}</ContentView>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default MainView
