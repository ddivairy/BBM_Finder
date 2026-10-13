import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Clock,
  MapPin,
  Send,
  Fuel,
  Radio,
  ChevronDown,
  Plus,
  BadgeCheck,
  ThumbsDown
} from 'lucide-react';
import { api } from '../services/api.mjs';

// "5 menit lalu" — pakai selisih dari server (akurat meski zona waktu beda)
function waktuLalu(menit) {
  if (typeof menit !== 'number') return '';
  if (menit < 1) return 'baru saja';
  if (menit < 60) return `${menit} menit lalu`;
  if (menit < 120) return '1 jam lalu';
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

function Avatar({ nama }) {
  const inisial = (nama || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0 select-none">
      {inisial}
    </div>
  );
}

export default function KomunitasPengecer({
  lokasiEceran,
  user,
  token,
  onLoginClick,
  onNotify,
}) {
  const [daftar, setDaftar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [teks, setTeks] = useState('');
  const [pakaiLokasi, setPakaiLokasi] = useState(false);
  const [lokasiId, setLokasiId] = useState('');
  const [tempat, setTempat] = useState('');
  const [sedangKirim, setSedangKirim] = useState(false);
  const [sedangLike, setSedangLike] = useState(null);

  const formRef = useRef(null);
  const textareaRef = useRef(null);

  const muat = async () => {
    try {
      const data = await api.getInfoPengecer(token);
      setDaftar(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (formTerbuka) textareaRef.current?.focus();
  }, [formTerbuka]);

  const handleBukaForm = () => {
    if (!user) {
      onNotify?.(
        'info',
        'Login dulu untuk ikut info',
        'Posting di komunitas butuh akun supaya infonya bisa dipercaya.'
      );
      onLoginClick?.();
      return;
    }
    setFormTerbuka((b) => !b);
  };

  const handleKirim = async (e) => {
    e.preventDefault();

    if (!teks.trim()) {
      onNotify?.('error', 'Isi infonya dulu', 'Tulis info yang mau dibagikan.');
      return;
    }

    if (!pakaiLokasi && !tempat.trim()) {
      onNotify?.(
        'error',
        'Lokasinya mana?',
        'Pilih dari daftar lokasi atau tulis nama tempatnya.'
      );
      return;
    }

    setSedangKirim(true);
    try {
      await api.kirimInfoPengecer(
        {
          teks: teks.trim(),
          lokasi_id: pakaiLokasi && lokasiId ? Number(lokasiId) : null,
          tempat: !pakaiLokasi ? tempat.trim() : null,
        },
        token
      );

      onNotify?.(
        'success',
        'Info terkirim!',
        'Terima kasih — pengendara subuh pasti terbantu.'
      );

      setTeks('');
      setTempat('');
      setLokasiId('');
      setPakaiLokasi(false);
      setFormTerbuka(false);
      await muat();
    } catch (err) {
      onNotify?.('error', 'Gagal memposting info', err.message);
    } finally {
      setSedangKirim(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      onNotify?.('info', 'Login dulu', 'Like butuh akun supaya tidak bisa spam.');
      onLoginClick?.();
      return;
    }

    setSedangLike(id);
    try {
      const hasil = await api.likeInfoPengecer(id, token);
      setDaftar((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                jumlah_like: hasil.jumlah_like,
                jumlah_dislike: hasil.jumlah_dislike,
                disukai_saya: hasil.disukai ? 1 : 0,
                tidak_disukai_saya: hasil.tidak_disukai ? 1 : 0,
              }
            : i
        )
      );
    } catch (err) {
      onNotify?.('error', 'Gagal', err.message);
    } finally {
      setSedangLike(null);
    }
  };

  const handleDislike = async (id) => {
    if (!user) {
      onNotify?.('info', 'Login dulu', 'Dislike butuh akun supaya tidak bisa spam.');
      onLoginClick?.();
      return;
    }

    setSedangLike(id);
    try {
      const hasil = await api.dislikeInfoPengecer(id, token);
      setDaftar((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                jumlah_like: hasil.jumlah_like,
                jumlah_dislike: hasil.jumlah_dislike,
                disukai_saya: hasil.disukai ? 1 : 0,
                tidak_disukai_saya: hasil.tidak_disukai ? 1 : 0,
              }
            : i
        )
      );
    } catch (err) {
      onNotify?.('error', 'Gagal', err.message);
    } finally {
      setSedangLike(null);
    }
  };

  return (
    <section
      id="komunitas-pengecer"
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
            Komunitas
          </span>

          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-2 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-red-500" />
            Pengecer Bensin
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Info bensin eceran yang <b>ready subuh-subuh</b> — berlaku sampai
            tengah malam hari ini.
          </p>
        </div>

        <button
          onClick={handleBukaForm}
          className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md shrink-0 inline-flex items-center gap-1.5"
        >
          {formTerbuka ? (
            'Tutup'
          ) : (
            <>
              <Plus size={14} />
              Posting info
            </>
          )}
        </button>
      </motion.div>

      {/* Form posting */}
      <AnimatePresence>
        {formTerbuka && (
          <motion.form
            ref={formRef}
            onSubmit={handleKirim}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 text-xs">
              {/* Baris avatar + textarea */}
              <div className="flex items-start gap-3">
                <Avatar nama={user?.nama} />

                <textarea
                  ref={textareaRef}
                  rows="3"
                  maxLength="500"
                  placeholder="Tulis info di sini... contoh: Pertamini Pak Asep dekat pasar buka jam 04.30, Pertalite ready."
                  value={teks}
                  onChange={(e) => setTeks(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="pl-12">
                <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Lokasi
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPakaiLokasi(false)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-semibold transition ${
                      !pakaiLokasi
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                  Tulis sendiri
                  </button>

                  <button
                    type="button"
                    onClick={() => setPakaiLokasi(true)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-semibold transition ${
                      pakaiLokasi
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                  Dari daftar lokasi
                  </button>
                </div>

                {!pakaiLokasi ? (
                  <input
                    type="text"
                    maxLength="150"
                    placeholder="Nama tempat / patokan (contoh: depan Indomaret Cipaganti)"
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <div className="relative">
                    <select
                      value={lokasiId}
                      onChange={(e) => setLokasiId(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">— Pilih lokasi eceran —</option>
                      {lokasiEceran.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nama}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Aksi */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 pl-12">
                <span className="text-[10px] text-gray-400">
                  {teks.length}/500
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormTerbuka(false)}
                    className="px-5 py-2.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={sedangKirim}
                    className="px-6 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition shadow-md inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send size={13} />
                    {sedangKirim ? 'Mengirim...' : 'Posting'}
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Feed */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400 border border-dashed rounded-xl bg-white dark:bg-gray-800">
          Memuat info komunitas...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 text-xs">
          Gagal memuat info: {error}
        </div>
      ) : daftar.length === 0 ? (
        <div className="p-10 text-center border border-dashed rounded-xl bg-white dark:bg-gray-800">
          <Radio
            size={28}
            className="mx-auto text-red-300 dark:text-red-700 mb-2"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Belum ada info hari ini.
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
            Jadilah yang pertama infoin bensin eceran yang ready subuh!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {daftar.map((info) => {
              const liked = Boolean(info.disukai_saya);
              const disliked = Boolean(info.tidak_disukai_saya);

              return (
                <motion.article
                  key={info.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Header kartu */}
                  <header className="flex items-start gap-3">
                    <Avatar nama={info.nama_pelapor} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                          {info.nama_pelapor}
                        </h3>
                        {info.status_verifikasi_pelapor === 'disetujui' && (
                          <BadgeCheck
                            size={15}
                            className="text-blue-500"
                            aria-label="User terverifikasi"
                            title="User terverifikasi"
                          />
                        )}

                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={11} />
                          {waktuLalu(info.menit_lalu)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-red-600 dark:text-red-400 font-medium">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">
                          {info.nama_lokasi || info.tempat || 'Lokasi bebas'}
                        </span>
                      </div>
                    </div>
                  </header>

                  {/* Isi info */}
                  <p className="text-sm text-gray-700 dark:text-gray-200 mt-2.5 whitespace-pre-line leading-relaxed">
                    {info.teks}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLike(info.id)}
                        disabled={sedangLike === info.id}
                        aria-label={liked ? 'Batalkan love pada info ini' : 'Love info ini'}
                        title={liked ? 'Klik untuk unlove' : 'Klik untuk love'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                          liked
                            ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-red-950/40'
                        }`}
                      >
                        <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                        {info.jumlah_like}
                        <span>Love</span>
                      </button>
                      <button
                        onClick={() => handleDislike(info.id)}
                        disabled={sedangLike === info.id}
                        aria-label={disliked ? 'Batalkan dislike pada info ini' : 'Dislike info ini'}
                        title={disliked ? 'Klik untuk membatalkan dislike' : 'Klik jika info ini salah'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                          disliked
                            ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/50 dark:border-orange-900 dark:text-orange-400'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-orange-950/40'
                        }`}
                      >
                        <ThumbsDown size={13} fill={disliked ? 'currentColor' : 'none'} />
                        {info.jumlah_dislike || 0}
                        <span>Dislike</span>
                      </button>
                    </div>

                  <span className="text-[10px] text-gray-400 text-right leading-tight block max-w-[110px]">
                    Berlaku sampai tengah malam
                  </span>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
