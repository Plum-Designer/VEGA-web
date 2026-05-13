'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const themes = {
  midnight: { name: 'Midnight Black', bg: '#000000', surface: 'rgba(255,255,255,0.06)', text: '#ffffff', textSecondary: '#999999', accent: '#ffffff', border: 'rgba(255,255,255,0.12)', tabBar: 'rgba(0,0,0,0.95)' },
  white: { name: 'Clean White', bg: '#ffffff', surface: 'rgba(0,0,0,0.04)', text: '#000000', textSecondary: '#555555', accent: '#000000', border: 'rgba(0,0,0,0.12)', tabBar: 'rgba(255,255,255,0.95)' },
  navy: { name: 'Navy Rose', bg: '#0B1957', surface: 'rgba(226,195,201,0.1)', text: '#ffffff', textSecondary: '#cbd5e1', accent: '#E2C3C9', border: 'rgba(226,195,201,0.2)', tabBar: 'rgba(11,25,87,0.95)' },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('midnight');

  useEffect(() => {
    const saved = localStorage.getItem('vega_theme');
    if (saved && themes[saved]) setCurrentTheme(saved);
  }, []);

  const switchTheme = (name) => {
    setCurrentTheme(name);
    localStorage.setItem('vega_theme', name);
    document.documentElement.setAttribute('data-theme', name);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.style.background = themes[currentTheme].bg;
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: themes[currentTheme], currentTheme, switchTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
