import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const THEME_STORAGE_KEY = 'amal_theme';
const COLOR_PALETTE_STORAGE_KEY = 'amal_color_palette';
export const VALID_PALETTES = ['default', 'green', 'blue', 'whatsapp', 'facebook'];

export function normalizePalette(palette) {
  if (palette === 'whatsapp') return 'green';
  if (palette === 'facebook') return 'blue';
  if (VALID_PALETTES.includes(palette)) return palette;
  return 'default';
}

const ThemeContext = createContext(null);

function getInitialColorPalette() {
  if (typeof window === 'undefined') return 'default';
  try {
    const saved = localStorage.getItem(COLOR_PALETTE_STORAGE_KEY);
    return normalizePalette(saved);
  } catch {}
  return 'default';
}

/**
 * Determines the initial theme based on:
 * 1. Previously stored preference in localStorage ('amal_theme')
 * 2. Operating system preference (prefers-color-scheme: dark)
 * 3. Default fallback to 'light'
 */
function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  const [colorPalette, setColorPaletteState] = useState(getInitialColorPalette);

  // Sync color palette to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-color-palette', colorPalette);
    try {
      localStorage.setItem(COLOR_PALETTE_STORAGE_KEY, colorPalette);
    } catch {}
  }, [colorPalette]);

  // Sync DOM and storage whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage might be restricted
    }

    // Keep theme-color meta tag in sync for browser chrome on mobile
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', isDark ? '#130d1b' : '#a169cf');
    }
  }, [theme]);

  // Listen to system preference changes if the user hasn't explicitly set one
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        // Only adapt automatically if user has never manually toggled
        if (!saved) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore
      }
    };

    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setColorPalette = useCallback((nextPalette) => {
    const normalized = normalizePalette(nextPalette);
    setColorPaletteState(normalized);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
      setTheme,
      toggleTheme,
      colorPalette,
      setColorPalette,
    }),
    [theme, setTheme, toggleTheme, colorPalette, setColorPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
