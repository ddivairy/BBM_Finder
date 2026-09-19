import { useState } from 'react';
import { motion } from 'motion/react';


export default function Hero({ searchQuery, setSearchQuery, onUseLocation, onResetSearch, userLocation }) {
  const [inputValue, setInputValue] = useState(searchQuery);
  return (
    <section className="py-16 px-4 sm:px-12 lg:px-24 text-center max-w-5xl mx-auto space-y-6">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-block text-[11px] font-semibold tracking-wider text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase"
      >
        Your Fuel, Your Way
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-3xl md:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white transition-colors"
      >
        Temukan BBM Sebelum{' '}
        <span className="text-red-600 dark:decoration-red-700">
          Kehabisan
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto transition-colors"
      >
        Cari SPBU atau BBM eceran di sekitar Anda atau sepanjang perjalanan.
      </motion.p>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="pt-2 max-w-xl mx-auto w-full"
      >
        
      <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 transition-colors">

        <input
          type="text"
          placeholder="Masukkan lokasi atau tujuan..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 px-4 py-2 text-sm focus:outline-none bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />

        <button
          type="button"
          onClick={() => {
            setInputValue('');
            setSearchQuery('');
            onUseLocation();

            setTimeout(() => {
              document.getElementById('hasil-bbm')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          }}
          className="block text-[10px] sm:text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-1 sm:px-3 py-2 transition whitespace-nowrap"
        >
          Gunakan lokasi saya
        </button>

        {(inputValue || userLocation) && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onResetSearch();
            }}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-2 transition whitespace-nowrap"
          >
            Reset
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setSearchQuery(inputValue);

            setTimeout(() => {
              document.getElementById('hasil-bbm')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }, 100);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs px-5 py-2.5 rounded-full transition shadow-sm whitespace-nowrap"
        >
          Cari BBM
        </button>

      </div>

      </motion.div>

    </section>
  );
}