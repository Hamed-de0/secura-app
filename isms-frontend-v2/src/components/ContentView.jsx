import { useTheme } from '@mui/material/styles';

const ContentView = ({ children, footer }) => {
  const theme = useTheme();
  return (
    <main
    style={{
      flex: 1,
      padding: '1rem',
      width: '100%',
      overflowY: 'auto',
      backgroundColor: theme.palette.background.default,
      marginTop: '4.1rem',
      boxSizing: 'border-box',
    }}
  >
    <div style={{ width: '100%' }}>
      {children}
    </div>
    {footer && <footer style={{ marginTop: '2rem' }}>{footer}</footer>}
  </main>
  );
  
}

export default ContentView
