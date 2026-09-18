import React, { useState } from 'react';
import { useLokasi } from './hooks/useLokasi.mjs';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MapView from './components/MapView.jsx';
import LocationList from './components/LocationList.jsx';
import AddLocationModal from './components/AddLocationModal.jsx';
import Footer from './components/Footer.jsx';
import FilterKategori from './components/FilterKategori.jsx';
import {motion} from 'framer-motion';
import 'leaflet/dist/leaflet.css';

export default function App() {
  const [userLocation, setUserLocation] = useState(null);

  const {
    lokasiList,
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
          onOpenAddModal={() => setIsModalOpen(true)}
          theme={theme}
          setTheme={setTheme}
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
              }
            );
          }}
        />

        {/* Main Content */}
        <main
          id="hasil-bbm"
          className="scroll-mt-24 max-w-6xl w-full mx-auto px-4 pb-12 flex-1 flex flex-col gap-4"
        >

          {/* Header + Filter */}
          <motion.div 
          
          initial={{opacity: 0, y:20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.7}}
          viewport={{once: true}}

          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

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

            {/* Filter */}
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
          
          initial={{opacity: 0, y:20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.7}}
          viewport={{once: true}}

          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

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

        {/* Footer */}
        <Footer onOpenAddModal={() => setIsAddModalOpen(true)} />

        {/* Add Location Modal */}
        <AddLocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />

      </div>
    </div>
  );
}