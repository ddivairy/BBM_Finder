import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix ikon marker Leaflet
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

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function AddLocationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'SPBU',
    harga: '',
    alamat: '',
    jam_buka: '',
    kontak: '',
    catatan: '',
    tipe_bensin: ['Pertalite'],
  });

  const [position, setPosition] = useState([-6.9175, 107.6191]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Gunakan Lokasi Saya
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser kamu tidak mendukung lokasi.');
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
        alert('Lokasi kamu tidak dapat ditemukan.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      alert('Harap centang konfirmasi informasi terlebih dahulu!');
      return;
    }

    setLoading(true);

    try {
      // DATA YANG SESUAI DENGAN BACKEND
      const payload = {
        nama: formData.nama,
        kategori: formData.kategori,
        alamat: formData.alamat,
        lintang: position[0],
        bujur: position[1],
        tipe_bensin: formData.tipe_bensin,
      };

      console.log('DATA YANG DIKIRIM:', payload);

      const res = await fetch('http://localhost:5000/api/lokasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Lokasi berhasil ditambahkan!');

        onSuccess();
        onClose();

        // Reset form
        setFormData({
          nama: '',
          kategori: 'SPBU',
          harga: '',
          alamat: '',
          jam_buka: '',
          kontak: '',
          catatan: '',
          tipe_bensin: ['Pertalite'],
        });

        setIsConfirmed(false);
        setPosition([-6.9175, 107.6191]);

      } else {
        console.error('RESPON BACKEND:', data);
        alert(data.message || 'Gagal menambah lokasi!');
      }

    } catch (err) {
      console.error('ERROR:', err);
      alert('Terjadi kesalahan koneksi ke backend!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">

      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 my-8 transition-colors">

        {/* Header */}
        <div className="space-y-1 mb-6">

          <span className="inline-block text-[10px] font-semibold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
            KONTRIBUSI KOMUNITAS
          </span>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Tambah Titik BBM
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bantu pengendara lain menemukan sumber BBM di sekitar mereka.
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
                value={formData.jam_buka}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jam_buka: e.target.value
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

            <p className="text-[10px] text-gray-400 mb-2">
              Klik pada peta untuk menentukan titik lokasi.
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
              {loading ? 'Mengirim...' : 'Kirim titik'}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}