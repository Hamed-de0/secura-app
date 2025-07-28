const ContentView = ({ children, footer }) => (
  <main
    style={{
      flex: 1,
      padding: '1rem',
      width: '100%',
      overflowY: 'auto',
      backgroundColor: '#faf6f6ff',
      marginTop: '4.1rem',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ width: '100%' }}>
      {children}
    </div>
    {footer && <footer style={{ marginTop: '2rem' }}>{footer}</footer>}
  </main>
)

export default ContentView
