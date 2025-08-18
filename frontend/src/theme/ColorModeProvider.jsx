// src/theme/ColorModeProvider.jsx
import React, { createContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import createAppTheme from './createAppTheme';

export const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export default function ColorModeProvider({ children }) {
  const [mode, setMode] = useState('light');

  // read persisted mode once
  useEffect(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark') setMode(saved);
  }, []);

  const value = useMemo(() => ({
    mode,
    toggleColorMode: () => {
      setMode(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', next);
        return next;
      });
    },
  }), [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
