import React from 'react';
import { Home, Compass, PlusCircle, Moon, Sun } from 'lucide-react';

export default function NavigationMenu({
  isDarkMode,
  setIsDarkMode,
  onMenuClick
}) {
  return (
    <div className="w-56 rounded-2xl bg-white dark:bg-gray-900 p-2 shadow-xl border border-gray-100 dark:border-gray-800 text-sm font-medium">

      {/* Menu Utama */}
      <div className="space-y-1">

        <button
          onClick={() => onMenuClick('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => onMenuClick('temukan')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Compass className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span> BBM</span>
        </button>

        <button
          onClick={() => onMenuClick('tambah')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Tambah Lokasi BBM</span>
        </button>

      </div>

      <hr className="my-2 border-gray-100 dark:border-gray-800" />

      {/* Mode Tampilan */}
      <div className="flex items-center justify-between px-3 py-2">

        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
          Mode Tampilan
        </span>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

      </div>

    </div>
  );
}
