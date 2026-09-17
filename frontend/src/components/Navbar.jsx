import React, { useState } from 'react';
import assets from '../assets/assets.mjs';
import ThemeToogleBtn from './ThemeToogleBtn';

export default function Navbar({
  onOpenAddModal,
  theme,
  setTheme
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);

    // Tambah titik → buka modal
    if (action === 'tambah') {
      onOpenAddModal();
      return;
    }

    // Home → scroll ke paling atas
    if (action === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    // Temukan BBM
    if (action === 'temukan') {
      const section = document.getElementById('hasil-bbm');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      return;
    }

    // Saran & Estimasi
    if (action === 'saran') {
      const section = document.getElementById('saran-estimasi');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      return;
    }
  };

  return (
    <header className="sticky top-0 px-6 md:px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center relative z-50 transition-colors">

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => handleMenuClick('home')}
      >
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
          <img
            src={
              theme === 'dark'
                ? assets.gas_station_dark
                : assets.gas_station
            }
            alt="BBM Finder Logo"
            className="w-5 h-5"
          />
        </div>

        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
            BBM<span className="text-red-600">Finder</span></span>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center gap-6">

        <button
          onClick={() => handleMenuClick('home')}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Home
        </button>

        <button
          onClick={() => handleMenuClick('temukan')}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Temukan BBM
        </button>

        <button
          onClick={() => handleMenuClick('tambah')}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Tambah Titik
        </button>

        <button
          onClick={() => handleMenuClick('saran')}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Saran & Estimasi
        </button>

        <ThemeToogleBtn
          theme={theme}
          setTheme={setTheme}
        />

      </nav>

      {/* Mobile Hamburger */}
      <div className="relative md:hidden">

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition flex items-center justify-center focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {isMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 text-xs font-medium space-y-1">

              <button
                onClick={() => handleMenuClick('home')}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-3 transition text-gray-700 dark:text-gray-200"
              >
                <span>🏠</span>
                <span>Home</span>
              </button>

              <button
                onClick={() => handleMenuClick('temukan')}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-3 transition text-gray-700 dark:text-gray-200"
              >
                <span>🗺️</span>
                <span>Temukan BBM</span>
              </button>

              <button
                onClick={() => handleMenuClick('tambah')}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-3 transition text-gray-700 dark:text-gray-200"
              >
                <span>➕</span>
                <span>Daftar Titik BBM Baru</span>
              </button>

              <button
                onClick={() => handleMenuClick('saran')}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-3 transition text-gray-700 dark:text-gray-200"
              >
                <span>💡</span>
                <span>Saran & Estimasi Bensin</span>
              </button>

              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

              {/* Theme Toggle */}
              <div className="px-4 py-2 flex items-center justify-between text-gray-700 dark:text-gray-200">
                <span>Mode Tampilan</span>

                <ThemeToogleBtn
                  theme={theme}
                  setTheme={setTheme}
                />
              </div>

            </div>
          </>
        )}

      </div>

    </header>
  );
}