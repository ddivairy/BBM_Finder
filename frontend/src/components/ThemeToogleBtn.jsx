import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToogleBtn = ({ theme, setTheme }) => {

  // Ambil tema yang tersimpan saat pertama kali web dibuka
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDarkMode = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      setTheme(prefersDarkMode ? 'dark' : 'light');
    }
  }, [setTheme]);

  // Terapkan tema + simpan ke localStorage
  useEffect(() => {
    if (!theme) return;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
      aria-label="Toggle Mode Tampilan"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
};

export default ThemeToogleBtn;