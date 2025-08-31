// src/theme/createAppTheme.js
import { createTheme } from '@mui/material/styles';

export default function createAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  const palette = {
    mode,
    primary: { main: '#2962FF' },
    secondary: { main: '#7C4DFF' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
    info: { main: '#0288D1' },
    background: {
      default: isDark ? '#0f1115' : '#F7F8FA',
      paper: isDark ? '#141922' : '#FFFFFF',
    },
    text: {
      primary: isDark ? '#E6E8EE' : '#111318',
      secondary: isDark ? '#A8B0BD' : '#4C5462',
    },
    // extra semantic slots we’ll use later
    surface: {
      header: isDark ? '#111723' : '#FFFFFF',
      rail: isDark ? '#0D1320' : '#F2F4F7',
      elevated: isDark ? '#1A2230' : '#FFFFFF',
    },
    graph: {
      riskHigh: '#D32F2F',
      riskMed: '#ED6C02',
      riskLow: '#2E7D32',
      neutral: isDark ? '#8491A3' : '#606770',
      ok: '#2E7D32',
      warn: '#ED6C02',
    },
  };

  return createTheme({
    palette,
    shape: { borderRadius: 12 },
    spacing: 8,
    typography: {
      // keep the rest
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      overline: { textTransform: 'none', letterSpacing: 0.3 },
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(0,0,0,0.04)',
      '0px 2px 6px rgba(0,0,0,0.06)',
      '0px 8px 24px rgba(0,0,0,0.08)',
      ...Array(22).fill('none'),
    ],
    components: {
      // subtle, consistent chips everywhere
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 600 },
        },
      },
      MuiDataGrid: {
        defaultProps: {
          density: 'compact',
          disableRowSelectionOnClick: true,
          hideFooterSelectedRowCount: true,
          // keep borders minimal for enterprise look
          showCellVerticalBorder: false,
          showColumnVerticalBorder: false,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            border: 0,
            backgroundColor: theme.palette.background.paper,
            // column headers row
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.surface.elevated
                  : theme.palette.action.hover,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            // header cells
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            // body cells
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            // row hover
            '& .MuiDataGrid-row:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
            },
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
    },
  });
}
