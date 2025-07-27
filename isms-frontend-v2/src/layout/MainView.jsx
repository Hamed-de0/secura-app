import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import ContentView from '../components/ContentView'
import Footer from '../components/Footer'

const MainView = ({ children }) => {
  const footer = <Footer />;
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#e5f57dff' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <ContentView footer={<Footer/>} style={{ flex: 1, width: '100%' }}>{children}</ContentView>
          
        </div>
      </div>
    </div>
  )
}

export default MainView
