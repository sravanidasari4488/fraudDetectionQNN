import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, allThemes, toggleTheme, setTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-label">Theme</div>
      <div className="theme-toggle-buttons">
        {Object.entries(allThemes).map(([key, themeData]) => (
          <button
            key={key}
            className={`theme-toggle-btn ${theme === key ? 'active' : ''}`}
            onClick={() => setTheme(key)}
            title={themeData.name}
            aria-label={`Switch to ${themeData.name} theme`}
          >
            <span className="theme-icon">{themeData.icon}</span>
            <span className="theme-name">{themeData.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;

