const ContentView = ({ children, footer }) => (
  <main
    style={{
      flex: 1,
      width: '100%',
      overflowY: 'auto',
      backgroundColor: '#faf6f6ff',
      marginTop: '3rem',
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
