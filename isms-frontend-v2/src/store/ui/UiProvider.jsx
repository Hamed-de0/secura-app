import React, { createContext, useEffect, useMemo, useState } from 'react';

export const UiContext = createContext({
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  setSidebarCollapsed: () => {},
});

export default function UiProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // read once
  useEffect(() => {
    const v = localStorage.getItem('sidebarCollapsed');
    if (v === 'true' || v === 'false') setSidebarCollapsed(v === 'true');
  }, []);

  // persist on change
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const value = useMemo(() => ({
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(v => !v),
  }), [sidebarCollapsed]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
