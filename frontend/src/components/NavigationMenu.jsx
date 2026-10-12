import React from 'react';
import { Home, Map, PlusCircle, Moon, Sun, User, LogOut, MessageSquareText, Fuel } from 'lucide-react';

export default function NavigationMenu({
  isDarkMode,
  setIsDarkMode,
  onMenuClick,
  user,
  onLoginClick,
  onLogout
}) {
  return (
    <div className="w-52 rounded-2xl bg-white dark:bg-gray-900 p-2 shadow-xl border border-gray-100 dark:border-gray-800 text-sm font-medium">

      {/* Navigasi */}
      <div className="space-y-0.5">

        <button
          onClick={() => onMenuClick('home')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => onMenuClick('peta')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Map className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Peta</span>
        </button>

        <button
          onClick={() => onMenuClick('laporan')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageSquareText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Forum Laporan</span>
        </button>

        <button
          onClick={() => onMenuClick('komunitas')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Fuel className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Komunitas Pengecer</span>
        </button>

        <button
          onClick={() => onMenuClick('tambah')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Tambah Lokasi</span>
        </button>

      </div>

      <hr className="my-2 border-gray-100 dark:border-gray-800" />

      {/* Akun */}
      <div className="space-y-0.5">
        {user ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Masuk</span>
          </button>
        )}
      </div>

      <hr className="my-2 border-gray-100 dark:border-gray-800" />

      {/* Pengaturan Tema */}
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
