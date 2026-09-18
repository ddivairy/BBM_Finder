import React, { useState } from 'react';
import assets from '../assets/assets.mjs';
import ThemeToogleBtn from './ThemeToogleBtn';
import NavigationMenu from './NavigationMenu';
import {motion, AnimatePresence} from 'framer-motion';

export default function Navbar({
  onOpenAddModal,
  theme,
  setTheme
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);

    if (action === 'tambah') {
      onOpenAddModal();
      return;
    }

    if (action === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    if (action === 'temukan') {
      const section = document.getElementById('hasil-bbm');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <header className="sticky top-0 px-6 md:px-8 py-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center relative z-50 transition-colors">

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
          BBM<span className="text-red-600">Finder</span>
        </span>
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
          Tambah Lokasi
        </button>

        <ThemeToogleBtn
          theme={theme}
          setTheme={setTheme}
        />

      </nav>

      {/* Mobile Menu */}
      <div className="relative md:hidden">

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition flex items-center justify-center focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <span className="text-lg leading-none">×</span>
          ) : (
            <span className="text-lg leading-none">☰</span>
          )}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
                className="absolute right-0 mt-2 z-50"
              >
                <NavigationMenu
                  isDarkMode={theme === 'dark'}
                  setIsDarkMode={(value) => {
                    setTheme(value ? 'dark' : 'light');
                  }}
                  onMenuClick={handleMenuClick}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>

    </header>
  );
}
