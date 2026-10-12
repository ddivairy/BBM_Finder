import React, { useState } from 'react';
import assets from '../assets/assets.mjs';
import NavigationMenu from './NavigationMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

export default function Navbar({
  onOpenAddModal,
  onLoginClick,
  onLogout,
  user,
  theme,
  setTheme,
  onShowLaporan,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);

    if (action === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (action === 'tambah') {
      onOpenAddModal();
      return;
    }

    if (action === 'laporan') {
      onShowLaporan?.();
      setTimeout(() => scrollToSection('laporan-sepi'), 100);
      return;
    }

    const sectionMap = {
      peta: 'hasil-bbm',
      temukan: 'hasil-bbm',
      komunitas: 'komunitas-pengecer',
      'laporan-beranda': 'laporan-beranda',
    };

    if (sectionMap[action]) {
      // Beri jeda kecil agar menu tertutup dulu sebelum scroll
      setTimeout(() => scrollToSection(sectionMap[action]), 50);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 px-6 md:px-8 py-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center relative z-50 transition-colors"
    >

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => handleMenuClick('home')}
      >
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
          <img
            src={theme === 'dark' ? assets.gas_station_dark : assets.gas_station}
            alt="BBM Finder Logo"
            className="w-5 h-5"
          />
        </div>
        <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
          BBM<span className="text-red-600">Finder</span>
        </span>
      </div>

      {/* Nav kanan */}
      <div className="flex items-center gap-3">

        {/* Beranda — hanya desktop */}
        <button
          onClick={() => handleMenuClick('home')}
          className="hidden md:inline-flex text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Beranda
        </button>

        {/* Peta — hanya desktop */}
        <button
          onClick={() => handleMenuClick('peta')}
          className="hidden md:inline-flex text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition"
        >
          Peta
        </button>

        {/* Ikon Akun */}
        {user ? (
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors">
              <User size={16} className="text-red-500" />
              <span className="hidden sm:inline max-w-[100px] truncate">{user.nama}</span>
            </button>

            {/* Dropdown logout */}
            <div className="absolute right-0 top-full mt-2 w-36 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-1.5">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors"
            aria-label="Masuk"
          >
            <User size={16} className="text-gray-400" />
            <span className="hidden sm:inline">Masuk</span>
          </button>
        )}

        {/* Hamburger — Tambah Lokasi, Pengaturan Tema, navigasi section */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition flex items-center justify-center focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <span className="text-lg leading-none">&times;</span>
            ) : (
              <span className="text-lg leading-none">&#9776;</span>
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

                {/* Dropdown Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 z-50"
                >
                  <NavigationMenu
                    isDarkMode={theme === 'dark'}
                    setIsDarkMode={(value) => setTheme(value ? 'dark' : 'light')}
                    onMenuClick={handleMenuClick}
                    user={user}
                    onLoginClick={() => { setIsMenuOpen(false); onLoginClick(); }}
                    onLogout={() => { setIsMenuOpen(false); onLogout(); }}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.header>
  );
}
