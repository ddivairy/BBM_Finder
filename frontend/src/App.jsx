import React, { useState } from 'react';
import { useLokasi } from './hooks/useLokasi.mjs';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MapView from './components/MapView.jsx';
import LocationList from './components/LocationList.jsx';
import AddLocationModal from './components/AddLocationModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';
import FilterKategori from './components/FilterKategori.jsx';
import LaporanSepi from './components/LaporanSepi.jsx';
import KomunitasPengecer from './components/KomunitasPengecer.jsx';
import LaporanBeranda from './components/LaporanBeranda.jsx';
import { motion } from 'framer-motion';
import { API_URL } from './services/api.mjs';
import 'leaflet/dist/leaflet.css';

const AUTH_KEY = 'bbm_auth';

export default function App() {
  const [userLocation, setUserLocation] = useState(null);

  const {
    lokasiList,
    semuaLokasi,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filterKategori,
    setFilterKategori,
    filterJarak,
    setFilterJarak,
    refetch
  } = useLokasi(userLocation);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Laporan Sepi — muncul saat ingin mengirim laporan
  const [showLaporanSepi, setShowLaporanSepi] = useState(false);
  const [refreshLaporan, setRefreshLaporan] = useState(0);

  const handleBukaLaporan = () => {
    setShowLaporanSepi(true);
    setTimeout(() => {
      document.getElementById('laporan-sepi')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  // ---- Sesi login (bertahan setelah refresh) ----
  const [auth, setAuth] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(AUTH_KEY));
      if (saved?.user && saved?.token) return saved;
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    return { user: null, token: null };
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [toast, setToast] = useState(null);

  const showToastNotification = (type, title, message) => {
    setToast({ id: Date.now(), type, title, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const handleLogin = (result) => {
    const nextAuth = { user: result.user, token: result.token };
    setAuth(nextAuth);
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
    setShowLogin(false);

    showToastNotification(
      'success',
      'Login berhasil!',
      `Selamat datang, ${result.user.nama}. Anda sekarang sudah masuk ke BBM Finder.`
    );
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
    } catch {
      // token tetap dibuang lokal meski server tak terjangkau
    }

    setAuth({ user: null, token: null });
    localStorage.removeItem(AUTH_KEY);

    showToastNotification('info', 'Anda telah logout.', 'Sampai jumpa lagi!');
  };

  // ---- Gate: tambah lokasi wajib login ----
  const handleOpenAddModal = () => {
    if (!auth.user) {
      showToastNotification(
        'info',
        'Login dulu untuk menambah lokasi',
        'Lokasi yang kamu tambahkan perlu login supaya bisa di-acc admin.'
      );
      setShowLogin(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setSelectedLokasi(null);
    setUserLocation(null);
    setFilterJarak('semua');
    setFilterKategori('semua');
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">

        {/* Navbar */}
        <Navbar
          user={auth.user}
          onOpenAddModal={handleOpenAddModal}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          theme={theme}
          setTheme={setTheme}
          onShowLaporan={handleBukaLaporan}
        />

        {/* Hero */}
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onResetSearch={handleResetSearch}
          userLocation={userLocation}
          onUseLocation={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setUserLocation(location);
                setSearchQuery('');
                setFilterJarak('semua');
                setFilterKategori('semua');
                setSelectedLokasi(null);
              },
              (error) => {
                console.log('Gagal mendapatkan lokasi:', error);
                console.log('Kode error:', error.code);
                console.log('Pesan error:', error.message);
              }
            );
          }}
        />

        {/* Main Content — Peta */}
        <main
          id="hasil-bbm"
          className="scroll-mt-24 max-w-6xl w-full mx-auto px-4 pb-12 flex-1 flex flex-col gap-4"
        >

          {/* Header + Filter (dekat area peta/list) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded font-semibold text-[10px]">
                  Bandung
                </span>
                <span className="dark:text-gray-400">
                  {userLocation
                    ? 'Menampilkan BBM terdekat dari lokasi Anda.'
                    : 'Gunakan lokasi untuk menemukan BBM terdekat.'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mt-1">
                Temukan BBM di Sekitarmu
              </h2>
            </div>

            {/* Filter SPBU & Pengecer — dekat kolom pencarian/daftar lokasi */}
            <FilterKategori
              filterKategori={filterKategori}
              setFilterKategori={setFilterKategori}
              filterJarak={filterJarak}
              setFilterJarak={setFilterJarak}
              userLocation={userLocation}
            />
          </motion.div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              Gagal memuat data lokasi: {error}
            </div>
          )}

          {/* Map + List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
          >
            <div className="lg:col-span-7 h-[420px] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <MapView
                lokasiList={lokasiList}
                selectedLokasi={selectedLokasi}
                userLocation={userLocation}
                onSelectLokasi={(item) => setSelectedLokasi(item)}
                theme={theme}
              />
            </div>

            <div className="lg:col-span-5">
              <LocationList
                lokasiList={lokasiList}
                loading={loading}
                selectedLokasi={selectedLokasi}
                onSelectLokasi={(item) => setSelectedLokasi(item)}
              />
            </div>
          </motion.div>
        </main>

        {/* Laporan BBM Terkini — tempat semua laporan berada */}
        <LaporanBeranda
          user={auth.user}
          token={auth.token}
          onLoginClick={() => setShowLogin(true)}
          onNotify={showToastNotification}
          onKirimLaporan={handleBukaLaporan}
          refreshTrigger={refreshLaporan}
        />

        {/* Form Laporan SPBU sepi — hanya form & ringkasan, tanpa duplikasi daftar laporan */}
        {showLaporanSepi && (
          <LaporanSepi
            lokasiList={semuaLokasi}
            user={auth.user}
            token={auth.token}
            onLoginClick={() => setShowLogin(true)}
            onNotify={showToastNotification}
            onSuccess={() => setRefreshLaporan(Date.now())}
            onClose={() => setShowLaporanSepi(false)}
          />
        )}

        {/* Komunitas Pengecer Bensin — tetap di Beranda */}
        <KomunitasPengecer
          lokasiEceran={semuaLokasi.filter((l) => l.kategori === 'eceran')}
          user={auth.user}
          token={auth.token}
          onLoginClick={() => setShowLogin(true)}
          onNotify={showToastNotification}
        />

        {/* Footer */}
        <Footer onOpenAddModal={handleOpenAddModal} />

        {/* Add Location Modal */}
        <AddLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          token={auth.token}
          userName={auth.user?.nama}
          onNotify={showToastNotification}
        />

        {/* Login Modal */}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
            onRegisterClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}

        {/* Register Modal */}
        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onRegister={async (data) => {
              try {
                const response = await fetch(`${API_URL}/auth/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                  showToastNotification('error', 'Pendaftaran gagal', result.message);
                  return;
                }

                showToastNotification(
                  'success',
                  'Pendaftaran berhasil!',
                  'Silakan login menggunakan akun Anda.'
                );

                setShowRegister(false);
                setShowLogin(true);

              } catch (error) {
                console.error('Register error:', error);
                showToastNotification(
                  'error',
                  'Tidak dapat terhubung ke server.',
                  'Coba lagi beberapa saat lagi.'
                );
              }
            }}
          />
        )}

        {/* Toast Notifikasi */}
        <Toast toast={toast} onClose={() => setToast(null)} />

      </div>
    </div>
  );
}
