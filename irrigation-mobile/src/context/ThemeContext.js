import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ darkMode, children }) {
  const theme = useMemo(
    () =>
      darkMode
        ? {
            darkMode: true,
            bg: '#101827',
            bgSoft: '#172033',
            card: '#172033',
            cardAlt: '#1e293b',
            border: 'rgba(147,197,253,0.18)',
            text: '#f8fafc',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
            track: '#2b3648',
            tabInactive: '#94a3b8',
            primary: '#60a5fa',
            purple: '#a78bfa',
            teal: '#5eead4',
            success: '#34d399',
            danger: '#f87171',
            warning: '#fbbf24',
            shadow: '#2563eb',
          }
        : {
            darkMode: false,
            bg: '#ebe7ff',
            bgSoft: '#dff1ff',
            card: '#f8fbff',
            cardAlt: '#eef6ff',
            border: 'rgba(109,40,217,0.14)',
            text: '#1e1b4b',
            secondary: '#64748b',
            muted: '#64748b',
            track: '#dbeafe',
            tabInactive: '#64748b',
            primary: '#2563eb',
            purple: '#7c3aed',
            teal: '#0f766e',
            success: '#059669',
            danger: '#dc2626',
            warning: '#d97706',
            shadow: '#4f46e5',
          },
    [darkMode]
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
}
