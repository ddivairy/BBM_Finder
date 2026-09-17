import React, { useState } from 'react';
import { useLokasi } from './hooks/useLokasi.mjs';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MapView from './components/MapView.jsx';
import LocationList from './components/LocationList.jsx';
import AddLocationModal from './components/AddLocationModal.jsx';
import SaranEstimasi from './components/SaranEstimasi.jsx';
import 'leaflet/dist/leaflet.css';
import Footer from './components/Footer.jsx';
import assets from './assets/assets.mjs';

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

  console.log('DATA LOKASI:', JSON.stringify(lokasiList, null, 2));

  const [theme, setTheme] = useState('light');
  const [selectedLokasi, setSelectedLokasi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('null');

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
          onUseLocation={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };

              console.log('LOKASI SAYA:', position.coords);
              setUserLocation(location);
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
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded font-semibold text-[10px]">Data Live</span>
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

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'semua', label: 'Semua' },
                { id: 'spbu', label: 'SPBU' },
                { id: 'eceran', label: 'BBM eceran' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterKategori(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                    filterKategori === tab.id 
                      ? 'bg-red-600 text-white shadow-sm' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <select
              value={filterJarak}
              onChange={(e) => setFilterJarak(e.target.value)}
              disabled={!userLocation}
              className="px-3 py-1.5 rounded-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50"
            >
              <option value="semua">Semua jarak</option>
              <option value="1">≤ 1 km</option>
              <option value="3">≤ 3 km</option>
              <option value="5">≤ 5 km</option>
            </select>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              Gagal memuat data lokasi: {error}
            </div>
          )}

          {/* Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7 h-[420px] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <MapView 
              lokasiList={lokasiList} 
              selectedLokasi={selectedLokasi}
              userLocation={userLocation}
              onSelectLokasi={(item) => setSelectedLokasi(item)}
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
          </div>
        </main>

        <div id="saran-estimasi" className="scroll-mt-24">
          <SaranEstimasi 
            userLocation={userLocation}
            lokasiList={lokasiList}
          />
        </div>

        <Footer />

        {/* Add Modal */}
        <AddLocationModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />

        {/* Add Modal */}
        <AddLocationModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
}