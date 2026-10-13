import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../services/api.mjs';

// Fix icon kayak di MapView
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Komponen penangkap klik peta
function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

return position 
? <Marker position={position} icon={markerIcon} /> 
: null;
}

function MapCenter({ position }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 15));
  }, [map, position]);
  return null;
}

const pilihanBensin = [
  'Pertalite',
  'Pertamax',
  'Pertamax Turbo',
  'Solar',
  'Dexlite',
  'Pertamina Dex',
];

export default function AddLocationModal({
  isOpen, 
  onClose, 
  onSuccess,
  token,
  userName,
  onNotify
}) {
  // Fallback aman kalau prop belum dikirim
  const notify = onNotify || ((type, title, message) => alert(`${title}\n${message || ''}`));

  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'spbu',
    harga: '',
    alamat: '',
    jam_operasi: '',
    kontak: '',
    catatan: '',
    tipe_bensin: ['Pertalite'],
  });

  const [position, setPosition] = useState([-6.9175, 107.6191]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearching(true);
    setSearchError('');
    setSearchResults([]);
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        limit: '5',
        countrycodes: 'id',
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error('Pencarian lokasi gagal. Coba lagi.');
      const results = await response.json();
      setSearchResults(results);
      if (!results.length) setSearchError('Lokasi tidak ditemukan. Coba nama tempat atau alamat lain.');
    } catch (error) {
      setSearchError(error.message || 'Tidak dapat mencari lokasi. Periksa koneksi internet.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    setPosition([Number(result.lat), Number(result.lon)]);
    setSearchResults([]);
    setFormData((current) => ({
      ...current,
      alamat: current.alamat || result.display_name,
    }));
  };


  // Gunakan Lokasi Saya
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      notify('error', 'Browser kamu tidak mendukung lokasi.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([
          pos.coords.latitude,
          pos.coords.longitude
        ]);
      },
      () => {
        notify('error', 'Lokasi kamu tidak dapat ditemukan.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      notify('error', 'Belum dikonfirmasi', 'Harap centang konfirmasi informasi terlebih dahulu!');
      return;
    }

    if (!token) {
      notify('error', 'Belum login', 'Silakan login terlebih dahulu untuk menambah lokasi.');
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Data disesuaikan dengan backend
      const payload = {
        nama: formData.nama,
        kategori: formData.kategori,
        alamat: formData.alamat,
        lintang: position[0],
        bujur: position[1],
        tipe_bensin: formData.tipe_bensin,
      };

      console.log('DATA YANG DIKIRIM:', payload);

      const res = await fetch(`${API_URL}/lokasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        notify(
          'success',
          'Lokasi berhasil dikirim!',
          'Menunggu persetujuan admin sebelum tampil di peta.'
        );

        onSuccess();
        onClose();

        // Reset form
        setFormData({
          nama: '',
          kategori: 'spbu',
          harga: '',
          alamat: '',
          jam_operasi: '',
          kontak: '',
          catatan: '',
          tipe_bensin: ['Pertalite'],
        });

        setIsConfirmed(false);
        setPosition([-6.9175, 107.6191]);

      } else if (res.status === 401) {
        notify('error', 'Sesi berakhir', data.message || 'Silakan login lagi.');
        onClose();
      } else {
        console.error('RESPON BACKEND:', data);
        notify('error', 'Gagal menambah lokasi', data.message || 'Coba lagi.');
      }

    } catch (err) {
      console.error('ERROR:', err);
      notify('error', 'Tidak dapat terhubung ke server', 'Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // Tampilan modal
  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start">

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 my-auto transition-colors">

        {/* Header */}
        <div className="space-y-1 mb-6">

          <span className="inline-block text-[10px] font-semibold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
            KONTRIBUSI KOMUNITAS
          </span>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Tambah Lokasi BBM
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bantu pengendara lain menemukan sumber BBM di sekitar mereka.
          </p>

          <p className="text-[10px] text-green-600 dark:text-green-400 font-medium pt-1">
            Masuk sebagai <span className="font-bold">{userName}</span> — lokasi yang kamu kirim
            akan <span className="font-bold">menunggu persetujuan admin</span> sebelum tampil di peta.
          </p>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-2">
            <span className="text-red-500 font-bold">*</span> Wajib diisi
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Nama */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nama tempat
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nama: e.target.value
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
          </div>

          {/* Jenis Titik & Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Jenis titik
                <span className="text-red-500 ml-1">*</span>
              </label>

              <select
                required
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kategori: e.target.value
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="SPBU">SPBU</option>
                <option value="eceran">
                  BBM Eceran / Pertamini
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Harga BBM
                <span className="text-gray-400 font-normal ml-1">
                  (opsional)
                </span>
              </label>

              <input
                type="text"
                placeholder="Contoh: Rp10.000/liter"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    harga: e.target.value
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Jenis BBM */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Jenis BBM
              <span className="text-red-500 ml-1">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pilihanBensin.map((bensin) => (
                <label
                  key={bensin}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition ${
                    formData.tipe_bensin.includes(bensin)
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={bensin}
                    checked={formData.tipe_bensin.includes(bensin)}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      setFormData((prev) => ({
                        ...prev,
                        tipe_bensin: checked
                          ? [...prev.tipe_bensin, bensin]
                          : prev.tipe_bensin.filter(
                              (item) => item !== bensin
                            ),
                      }));
                    }}
                    className="accent-red-600"
                  />

                  <span className="text-[11px] text-gray-700 dark:text-gray-300">
                    {bensin}
                  </span>
                </label>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 mt-1.5">
              Pilih satu atau lebih jenis BBM yang tersedia.
            </p>
          </div>

          {/* Alamat */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Alamat atau patokan lokasi
              <span className="text-red-500 ml-1">*</span>
            </label>

            <input
              type="text"
              required
              value={formData.alamat}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  alamat: e.target.value
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Jam Buka & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Jam buka
                <span className="text-gray-400 font-normal ml-1">
                  (opsional)
                </span>
              </label>

              <input
                type="text"
                placeholder="Contoh: 24 jam"
                value={formData.jam_operasi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jam_operasi: e.target.value
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nomor kontak
                <span className="text-gray-400 font-normal ml-1">
                  (opsional)
                </span>
              </label>

              <input
                type="text"
                placeholder="Opsional"
                value={formData.kontak}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kontak: e.target.value
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Peta */}
          <div>

            <div className="flex justify-between items-center mb-1">

              <label className="font-semibold text-gray-700 dark:text-gray-300">
                Pilih lokasi pada peta
                <span className="text-red-500 ml-1">*</span>
              </label>

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="text-red-600 dark:text-red-400 font-semibold text-[11px] hover:underline"
              >
                Gunakan lokasi saya
              </button>

            </div>

            <form onSubmit={handleSearchLocation} className="mb-2">
              <div className="flex gap-2">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama tempat atau alamat..."
                  aria-label="Cari lokasi di peta"
                  className="min-w-0 flex-1 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold disabled:opacity-50"
                >
                  {searching ? 'Mencari...' : 'Cari'}
                </button>
              </div>
              {searchError && <p role="status" className="text-[10px] text-amber-600 mt-1">{searchError}</p>}
              {searchResults.length > 0 && (
                <ul className="mt-1 max-h-32 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  {searchResults.map((result) => (
                    <li key={result.place_id}>
                      <button
                        type="button"
                        onClick={() => selectSearchResult(result)}
                        className="w-full px-3 py-2 text-left text-[11px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {result.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </form>
            <p className="text-[10px] text-gray-400 mb-2">
              Cari tempat atau klik peta untuk menentukan titik lokasi.
            </p>

            <div className="h-40 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">

              <MapContainer
                center={position}
                zoom={13}
                className="h-full w-full"
              >

                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenter position={position} />

                <LocationPicker
                  position={position}
                  setPosition={setPosition}
                />

              </MapContainer>

            </div>
          </div>

          {/* Foto */}
          <div>

            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Foto lokasi
              <span className="text-gray-400 font-normal ml-1">
                (opsional)
              </span>
            </label>

            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition">
              Unggah foto opsional atau klik untuk memilih
            </div>
          </div>

          {/* Catatan */}
          <div>

            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Catatan tambahan
              <span className="text-gray-400 font-normal ml-1">
                (opsional)
              </span>
            </label>

            <textarea
              rows="2"
              placeholder="Contoh: hanya buka malam hari"
              value={formData.catatan}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  catatan: e.target.value
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Konfirmasi */}
          <div className="flex items-center gap-2 pt-2">

            <input
              type="checkbox"
              id="confirm"
              checked={isConfirmed}
              onChange={(e) =>
                setIsConfirmed(e.target.checked)
              }
              className="rounded accent-red-600"
            />

            <label
              htmlFor="confirm"
              className="text-gray-600 dark:text-gray-400 text-[11px]"
            >
              Saya memastikan informasi ini benar.
              <span className="text-red-500 ml-1">*</span>
            </label>

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
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Kirim lokasi'}
            </button>

          </div>

        </form>

      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
