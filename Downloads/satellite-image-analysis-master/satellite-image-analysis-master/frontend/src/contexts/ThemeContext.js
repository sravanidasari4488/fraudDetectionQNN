import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'space';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themes = {
    space: {
      name: 'Space Dark',
      icon: '🌌',
      colors: {
        primary: '#14b8a6',
        primaryDark: '#0d9488',
        secondary: '#06b6d4',
        background: '#0a0e27',
        backgroundSecondary: '#1a1f3a',
        surface: '#1e293b',
        text: '#ffffff',
        textSecondary: '#cbd5e1',
        accent: '#14b8a6',
        border: 'rgba(20, 184, 166, 0.2)',
        cardBg: '#1e293b',
        gradient: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        headerGradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      }
    },
    earth: {
      name: 'Earth Light',
      icon: '🌍',
      colors: {
        primary: '#10b981',
        primaryDark: '#059669',
        secondary: '#3b82f6',
        background: '#f8fafc',
        backgroundSecondary: '#f1f5f9',
        surface: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        accent: '#10b981',
        border: '#e2e8f0',
        cardBg: '#ffffff',
        gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        headerGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      }
    },
    data: {
      name: 'Data Neon',
      icon: '📊',
      colors: {
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        secondary: '#f59e0b',
        background: '#1e293b',
        backgroundSecondary: '#0f172a',
        surface: '#334155',
        text: '#ffffff',
        textSecondary: '#cbd5e1',
        accent: '#3b82f6',
        border: 'rgba(59, 130, 246, 0.3)',
        cardBg: '#334155',
        gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        headerGradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      }
    }
  };

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const setThemeByName = (themeName) => {
    if (themes[themeName]) {
      setTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themes: themes[theme], 
      allThemes: themes,
      toggleTheme, 
      setTheme: setThemeByName 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

