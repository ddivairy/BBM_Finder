import React from 'react';

export default function Footer() {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors">
      
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Main Footer */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand */}
          <div className="max-w-sm">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xl font-extrabold text-gray-900 dark:text-white"
            >
              BBM<span className="text-red-600">Finder</span>
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              Temukan sumber BBM di sekitarmu dengan lebih mudah,
              baik SPBU maupun BBM eceran.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Navigasi
            </h3>

            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                className="text-sm text-left text-gray-500 dark:text-gray-400 hover:text-red-600 transition"
              >
                Beranda
              </button>

              <button
                onClick={() => scrollToSection('hasil-bbm')}
                className="text-sm text-left text-gray-500 dark:text-gray-400 hover:text-red-600 transition"
              >
                Temukan BBM
              </button>

              <button
                onClick={() => scrollToSection('saran-estimasi')}
                className="text-sm text-left text-gray-500 dark:text-gray-400 hover:text-red-600 transition"
              >
                Estimasi BBM
              </button>
            </div>
          </div>

          {/* Kontribusi */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">
              Kontribusi
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Menemukan titik BBM yang belum tersedia?
              Bantu pengguna lain dengan menambahkan lokasi baru.
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 pt-5 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            © 2026 BBM Finder. Dibuat untuk memudahkan perjalanan.
          </p>

          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Data lokasi bersumber dari OpenStreetMap.
          </p>

        </div>

      </div>
    </footer>
  );
}