import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { api } from '../services/api.mjs';

const pilihanStatus = [
  {
    value: 'sepi',
    label: 'Sepi',
    deskripsi: 'Antrian pendek',
    kelas: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-900 dark:text-green-400',
    kelasAktif: 'bg-green-600 border-green-600 text-white dark:bg-green-600 dark:border-green-600',
  },
  {
    value: 'normal',
    label: 'Normal',
    deskripsi: 'Antrian wajar',
    kelas: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400',
    kelasAktif: 'bg-amber-500 border-amber-500 text-white dark:bg-amber-500 dark:border-amber-500',
  },
  {
    value: 'ramai',
    label: 'Ramai',
    deskripsi: 'Antre panjang',
    kelas: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400',
    kelasAktif: 'bg-red-600 border-red-600 text-white dark:bg-red-600 dark:border-red-600',
  },
];

export default function LaporanSepi({
  lokasiList,
  user,
  token,
  onLoginClick,
  onNotify,
  onSuccess,
  onClose,
}) {
  const [laporan, setLaporan] = useState([]);
  const [lokasiId, setLokasiId] = useState('');
  const [status, setStatus] = useState('sepi');
  const [komentar, setKomentar] = useState('');
  const [sedangKirim, setSedangKirim] = useState(false);

  const selectRef = useRef(null);

  const muatLaporan = async () => {
    try {
      const data = await api.getLaporan(token);
      setLaporan(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    muatLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  const handleKirim = async (e) => {
    e.preventDefault();

    if (!user) {
      onNotify?.(
        'info',
        'Login dulu untuk melapor',
        'Laporan butuh akun supaya bisa dipercaya orang lain.'
      );
      onLoginClick?.();
      return;
    }

    if (!lokasiId) {
      onNotify?.('error', 'Pilih lokasi dulu', 'Tentukan SPBU yang mau dilapor.');
      return;
    }

    setSedangKirim(true);
    try {
      await api.kirimLaporan(
        lokasiId,
        { status, komentar: komentar.trim() || null },
        token
      );

      const pilihan = pilihanStatus.find((p) => p.value === status);
      onNotify?.(
        'success',
        `Laporan "${pilihan.label}" terkirim!`,
        'Terima kasih — laporanmu membantu pengendara lain.'
      );

      setKomentar('');
      setLokasiId('');
      await muatLaporan();
      onSuccess?.();
      onClose?.();

      setTimeout(() => {
        document.getElementById('laporan-beranda')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 200);
    } catch (err) {
      onNotify?.('error', 'Gagal mengirim laporan', err.message);
    } finally {
      setSedangKirim(false);
    }
  };

  // Ringkasan: lokasi yang paling banyak dilaporkan sepi
  const ringkasan = pilihanStatus.map((p) => ({
    ...p,
    jumlah: laporan.filter((l) => l.status === p.value).length,
  }));

  return (
    <section
      id="laporan-sepi"
      className="scroll-mt-24 max-w-6xl w-full mx-auto px-4 pb-12"
    >
      {/* Header section (tanpa tombol tutup form) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <span className="inline-block text-[10px] font-semibold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
          Laporan Komunitas
        </span>

        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-2">
          Mana SPBU yang lagi sepi?
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Laporan berlaku 2 jam terakhir — makin banyak yang like, makin bisa dipercaya.
        </p>
      </motion.div>

      {/* Ringkasan status */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {ringkasan.map((r) => (
          <div
            key={r.value}
            className={`p-3 rounded-xl border text-center ${r.kelas}`}
          >
            <div className="text-xl font-extrabold">{r.jumlah}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide">
              {r.label}
            </div>
          </div>
        ))}
      </div>

      {/* Form laporan (selalu terbuka langsung) */}
      <motion.form
        onSubmit={handleKirim}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lokasi
              <span className="text-red-500 ml-1">*</span>
            </label>

            <select
              ref={selectRef}
              required
              value={lokasiId}
              onChange={(e) => setLokasiId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">— Pilih SPBU / lokasi —</option>
              {lokasiList.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kondisi saat ini
              <span className="text-red-500 ml-1">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {pilihanStatus.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setStatus(p.value)}
                  className={`px-3 py-2.5 rounded-xl border text-center transition ${
                    status === p.value ? p.kelasAktif : p.kelas
                  }`}
                >
                  <span className="block font-bold text-xs">
                    {p.label}
                  </span>
                  <span className="block text-[9px] opacity-80 mt-0.5">
                    {p.deskripsi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Komentar{' '}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>

            <textarea
              rows="2"
              maxLength="300"
              placeholder="Contoh: pump kosong semua, bisa langsung masuk..."
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setKomentar('');
                setLokasiId('');
                onClose?.();
              }}
              className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={sedangKirim}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={13} />
              {sedangKirim ? 'Mengirim...' : 'Kirim laporan'}
            </button>
          </div>
        </div>
      </motion.form>
    </section>
  );
}
