
import React, { useState } from 'react';

const hitungJarak = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function SaranEstimasi({ userLocation, lokasiList }) {
  const [tujuan, setTujuan] = useState('');
  const [tujuanTerpilih, setTujuanTerpilih] = useState(null);
  const [jenisKendaraan, setJenisKendaraan] = useState('Motor');
  const [jenisBBM, setJenisBBM] = useState('');
  const [kapasitasTangki, setKapasitasTangki] = useState(12);
  const [hasil, setHasil] = useState(null);

  const rekomendasiTujuan = tujuan.trim()
    ? lokasiList.filter((item) =>
        item.nama.toLowerCase().includes(tujuan.toLowerCase()) ||
        (item.alamat || '').toLowerCase().includes(tujuan.toLowerCase())
      )
    : [];

  const rekomendasiBBM = jenisBBM
    ? lokasiList.filter((item) =>
        item.tipe_bensin.some(
          (bensin) =>
            bensin.toLowerCase() === jenisBBM.toLowerCase()
        )
      )
    : lokasiList;

  const handleLihatEstimasi = (e) => {
    e.preventDefault();

    if (!userLocation) {
      alert('Silakan gunakan lokasi kamu terlebih dahulu.');
      return;
    }

    if (!tujuanTerpilih) {
      alert('Silakan pilih lokasi tujuan terlebih dahulu.');
      return;
    }

    const efisiensi = jenisKendaraan === 'Motor' ? 40 : 12;

    const estimasiJarak = hitungJarak(
      userLocation.lat,
      userLocation.lng,
      parseFloat(tujuanTerpilih.lintang),
      parseFloat(tujuanTerpilih.bujur)
    );

    const jarak = estimasiJarak.toFixed(1);

    // Perjalanan pulang-pergi
    const jarakPulangPergi = estimasiJarak * 2;

    const bensinDibutuhkan = jarakPulangPergi / efisiensi;

    const persentaseTangki = Math.min(
      100,
      (bensinDibutuhkan / Number(kapasitasTangki)) * 100
    );

    setHasil({
      jarak,
      jarakPulangPergi: jarakPulangPergi.toFixed(1),
      liter: bensinDibutuhkan.toFixed(2),
      persen: persentaseTangki
    });
  };

  return (
    <section
        id="saran-estimasi"
        className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6"
    >


      {/* Header */}
      <div className="space-y-2">
        <span className="inline-block text-[11px] font-bold tracking-wider text-red-500 bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40 px-3 py-1 rounded-full uppercase">
          PERENCANAAN PERJALANAN
        </span>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Saran & Estimasi
        </h2>

        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
          Rencanakan perjalanan dan temukan titik BBM yang paling sesuai.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
        <form onSubmit={handleLihatEstimasi} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">

            {/* Lokasi Awal */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Lokasi awal
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={
                    userLocation
                      ? 'Lokasi saya saat ini'
                      : 'Lokasi belum tersedia'
                  }
                  readOnly
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none"
                />

                {userLocation && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                    ✓
                  </span>
                )}
              </div>

              {!userLocation && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Gunakan lokasi kamu untuk memulai estimasi.
                </p>
              )}
            </div>

            {/* Tujuan */}
            <div className="relative">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tujuan
              </label>

              <input
                type="text"
                placeholder="Masukkan tujuan..."
                value={tujuan}
                onChange={(e) => {
                  setTujuan(e.target.value);
                  setTujuanTerpilih(null);
                  setHasil(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {rekomendasiTujuan.length > 0 && !tujuanTerpilih && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  {rekomendasiTujuan.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTujuan(item.nama);
                        setTujuanTerpilih(item);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="text-xs font-semibold text-gray-800 dark:text-white">
                        📍 {item.nama}
                      </div>

                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {item.jarak !== null
                          ? item.jarak < 1
                            ? `${Math.round(item.jarak * 1000)} m dari lokasi kamu`
                            : `${item.jarak.toFixed(1)} km dari lokasi kamu`
                          : item.alamat || 'Alamat belum tersedia'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Jenis BBM */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Jenis BBM
              </label>

              <select
                value={jenisBBM}
                onChange={(e) => setJenisBBM(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Semua BBM</option>
                <option value="Pertalite">Pertalite</option>
                <option value="Pertamax">Pertamax</option>
                <option value="Pertamax Turbo">Pertamax Turbo</option>
                <option value="Solar">Solar</option>
              </select>
            </div>

            {/* Jenis Kendaraan */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Jenis kendaraan
              </label>

              <select
                value={jenisKendaraan}
                onChange={(e) => setJenisKendaraan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Motor">Motor</option>
                <option value="Mobil">Mobil</option>
              </select>
            </div>

            {/* Kapasitas Tangki */}
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Kapasitas tangki (liter)
              </label>

              <input
                type="number"
                min="1"
                value={kapasitasTangki}
                onChange={(e) => setKapasitasTangki(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

          </div>

          {/* Tombol */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition shadow-md"
            >
              Lihat estimasi
            </button>
          </div>

        </form>
      </div>

      {/* Hasil Estimasi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
        {hasil ? (
          <div className="max-w-md mx-auto space-y-3">

            <span className="text-3xl">⛽</span>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Estimasi Perjalanan: Lokasi saya → {tujuan}
            </h3>

            <div className="grid grid-cols-3 gap-3 pt-2">

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-xs text-gray-400">
                  Jarak ke Tujuan
                </div>

                <div className="font-bold text-red-600 text-sm mt-0.5">
                  {hasil.jarak} km
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-xs text-gray-400">
                  Est. Bensin PP
                </div>

                <div className="font-bold text-red-600 text-sm mt-0.5">
                  {hasil.liter} Liter
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="text-xs text-gray-400">
                  Porsi Tangki
                </div>

                <div className="font-bold text-red-600 text-sm mt-0.5">
                  {hasil.persen.toFixed(1)}%
                </div>
              </div>

            </div>

            <p className="text-[10px] text-gray-400">
              Jarak pulang-pergi: {hasil.jarakPulangPergi} km
            </p>

          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">
              Belum ada estimasi perjalanan
            </h3>

            <p className="text-xs text-gray-400">
              Gunakan lokasi kamu dan pilih tujuan untuk melihat estimasi perjalanan.
            </p>
          </div>
        )}
      </div>

      {/* Rekomendasi BBM */}
      {jenisBBM && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">

          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Rekomendasi lokasi {jenisBBM}
          </h3>

          <p className="text-xs text-gray-400 mt-1 mb-4">
            Lokasi dengan jenis BBM yang kamu pilih.
          </p>

          <div className="space-y-2">

            {rekomendasiBBM.length > 0 ? (
              rekomendasiBBM.slice(0, 5).map((item) => (

                <div
                  key={item.id}
                  onClick={() => {
                    setTujuan(item.nama);
                    setTujuanTerpilih(item);
                    setHasil(null);
                  }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >

                  <div className="min-w-0">

                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                      {item.nama}
                    </p>

                    <p className="text-[10px] text-gray-400 truncate">
                      {item.alamat || 'Alamat belum tersedia'}
                    </p>

                  </div>

                  <span className="text-[10px] font-semibold text-red-600 whitespace-nowrap">
                    {item.jarak !== null
                      ? item.jarak < 1
                        ? `${Math.round(item.jarak * 1000)} m`
                        : `${item.jarak.toFixed(1)} km`
                      : '—'}
                  </span>

                </div>

              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                Belum ada lokasi yang menyediakan {jenisBBM}.
              </p>
            )}

          </div>

        </div>
      )}

      <div className="text-center text-[11px] text-gray-400 pt-4">
        BBM Finder • Data demo untuk prototype
      </div>

    </section>
  );
}
