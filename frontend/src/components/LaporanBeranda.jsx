import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, MapPin, MessageSquareText, Send, Plus } from 'lucide-react';
import { api } from '../services/api.mjs';

const gayaStatus = {
  sepi: {
    label: 'Sepi',
    kelas: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-900 dark:text-green-400',
  },
  normal: {
    label: 'Normal',
    kelas: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-400',
  },
  ramai: {
    label: 'Ramai',
    kelas: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400',
  },
};

function waktuLalu(menit, timestamp) {
  if (typeof menit === 'number') {
    if (menit < 1) return 'baru saja';
    if (menit < 60) return `${menit} menit lalu`;
    if (menit < 120) return '1 jam lalu';
    return `${Math.round(menit / 60)} jam lalu`;
  }
  if (!timestamp) return '';
  const then = new Date(String(timestamp).replace(' ', 'T'));
  const selisih = Math.round((Date.now() - then.getTime()) / 60000);
  if (selisih < 1) return 'baru saja';
  if (selisih < 60) return `${selisih} menit lalu`;
  if (selisih < 120) return '1 jam lalu';
  return `${Math.round(selisih / 60)} jam lalu`;
}

const PREVIEW_COUNT = 3;

export default function LaporanBeranda({
  user,
  token,
  onLoginClick,
  onNotify,
  onKirimLaporan,
  refreshTrigger,
}) {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sedangLike, setSedangLike] = useState(null);
  const [tampilkanSemua, setTampilkanSemua] = useState(false);

  const muatData = () => {
    api.getLaporan(token)
      .then((data) => setLaporan(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    muatData();
  }, [token, refreshTrigger]);

  const handleLike = async (id) => {
    if (!user) {
      onNotify?.('info', 'Login dulu', 'Like butuh akun supaya tidak bisa spam.');
      onLoginClick?.();
      return;
    }
    setSedangLike(id);
    try {
      const hasil = await api.likeLaporan(id, token);
      setLaporan((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, jumlah_like: hasil.jumlah_like, disukai_saya: hasil.disukai ? 1 : 0 }
            : l
        )
      );
    } catch (err) {
      onNotify?.('error', 'Gagal', err.message);
    } finally {
      setSedangLike(null);
    }
  };

  const laporanTampil = tampilkanSemua ? laporan : laporan.slice(0, PREVIEW_COUNT);

  return (
    <section
      id="laporan-beranda"
      className="scroll-mt-24 max-w-6xl w-full mx-auto px-4 pb-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4"
      >
        <div>
          <span className="inline-block text-[10px] font-semibold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
            Laporan Komunitas
          </span>

          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-2 flex items-center gap-2">
            <MessageSquareText className="w-6 h-6 text-red-500" />
            Laporan BBM Terkini
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Kondisi SPBU terkini — dilaporkan oleh sesama pengendara.
          </p>
        </div>

        {/* Tombol aksi */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={onKirimLaporan}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md"
          >
            <Plus size={14} />
            <span>Kirim Laporan</span>
          </button>

          {laporan.length > PREVIEW_COUNT && (
            <button
              onClick={() => setTampilkanSemua(!tampilkanSemua)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            >
              <MessageSquareText size={14} />
              <span>{tampilkanSemua ? 'Tampilkan Sedikit' : `Lihat Semua (${laporan.length})`}</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Konten laporan */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 border border-dashed rounded-xl bg-white dark:bg-gray-800">
          Memuat laporan...
        </div>
      ) : laporan.length === 0 ? (
        <div className="p-10 text-center border border-dashed rounded-xl bg-white dark:bg-gray-800">
          <MessageSquareText size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada laporan dalam 2 jam terakhir.</p>
          <button
            onClick={onKirimLaporan}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md"
          >
            <Send size={12} />
            Kirim Laporan Pertama
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {laporanTampil.map((l) => {
              const gaya = gayaStatus[l.status] || gayaStatus.normal;
              const liked = Boolean(l.disukai_saya);

              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${gaya.kelas}`}>
                          {gaya.label}
                        </span>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {l.nama_lokasi}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {waktuLalu(l.menit_lalu, l.dibuat_pada)}
                        </span>
                        <span className="truncate">
                          oleh <b className="text-gray-500 dark:text-gray-300">{l.nama_pelapor}</b>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(l.id)}
                      disabled={sedangLike === l.id}
                      aria-label="Setujui laporan ini"
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                        liked
                          ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                      {l.jumlah_like}
                    </button>
                  </div>

                  {l.komentar && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 pl-3 border-l-2 border-red-200 dark:border-red-900/60">
                      {l.komentar}
                    </p>
                  )}

                  <div className="mt-2 text-[10px] text-gray-400 inline-flex items-center gap-1">
                    <MapPin size={11} className="text-red-400" />
                    {l.alamat || 'Alamat belum tersedia'}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Tombol Lihat Semua di bawah (jika belum dibuka semua) */}
          {!tampilkanSemua && laporan.length > PREVIEW_COUNT && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setTampilkanSemua(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md"
              >
                <MessageSquareText size={14} />
                Lihat Semua {laporan.length} Laporan
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
