import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterModal({
  onClose,
  onRegister,
  onLoginClick
}) {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== konfirmasiPassword) {
      alert('Konfirmasi password tidak cocok!');
      return;
    }

    // Sementara simulasi daftar
    onRegister({
      nama,
      email,
      password
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-center"
      >

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
          className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors"
        >

          {/* Header */}
          <div className="space-y-1 mb-6">

            <span className="inline-block text-[10px] font-semibold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
              PENGGUNA BARU
            </span>

            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Buat Akun
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Daftar untuk ikut berkontribusi di BBM Finder.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-xs"
          >

            {/* Nama */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nama
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Konfirmasi password
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="password"
                required
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Batal
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md"
              >
                Daftar
              </button>

            </div>

          </form>

          {/* Login */}
          <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-5">
            Sudah punya akun?
            <button
              type="button"
              onClick={onLoginClick}
              className="text-red-500 font-semibold ml-1 hover:underline"
            >
              Login
            </button>
          </p>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}