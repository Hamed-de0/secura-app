import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    
  palette: {
    mode: 'light', // You can toggle this to 'dark' later
    primary: {
      main: '#1976d2', // Blue
      contrastText: '#fff'
    },
    secondary: {
      main: '#9c27b0', // Purple
    },
    background: {
        bars: '#b2cde8ff', // Light gray for bars
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#616161'
    }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    fontSize: 14,
    h4: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        }
      }
    }
  }
})

export default theme
