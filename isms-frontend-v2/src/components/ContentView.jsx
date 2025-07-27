
const ContentView = ({ children }) => (
    
  <main style={{
    flex: 1,
    padding: '2rem',
    margin: '10px',

    display: 'flex',
    overflowY: 'auto',
    backgroundColor: 'white',
  }}>
    {children}
  </main>
)

export default ContentView
