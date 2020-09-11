import { useState, useEffect } from 'react';

export function useThemeMode() {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return media.matches;
  });

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    };
    media.addEventListener('change', handler);

    return function cleanup() {
      media.removeEventListener('change', handler);
    };
  }, []);

  return {
    isDarkMode,
  };
}
