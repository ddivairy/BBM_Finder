import React, { useState } from 'react';

const Navbar = ({ theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Asset gambar online eksternal
  const assets = {
    logo: "https://img.icons8.com/color/96/gas-station.png",
    arrow_icon: "https://img.icons8.com/ios-glyphs/30/ffffff/long-arrow-right.png",
  };

  return (
    <nav style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '32px 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '240px',
      zIndex: 50,
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#1e293b',
      borderRight: '1px solid ' + (theme === 'dark' ? '#334155' : '#e2e8f0'),
      fontFamily: 'sans-serif'
    }}>

      {/* 1. BAGIAN ATAS: LOGO & MENU LINKS */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={assets.logo} 
            alt="Logo" 
            style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
          />
          <span style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '-0.5px' }}>
            bbm<span style={{ color: '#2563eb' }}>.finder</span>
          </span>
        </div>

        {/* MENU LINKS (MENURUN KE BAWAH) */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          fontSize: '15px',
          fontWeight: '500'
        }}>
          <a href="#home" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a>
          <a href="#peta" style={{ color: 'inherit', textDecoration: 'none' }}>Peta BBM</a>
          <a href="#daftar" style={{ color: 'inherit', textDecoration: 'none' }}>Daftar Tempat</a>
          <a href="#tambah" style={{ color: 'inherit', textDecoration: 'none' }}>Tambah Lokasi</a>
        </div>

      </div>

      {/* 2. BAGIAN BAWAH: TOGGLE THEME & TOMBOL CONNECT */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Tombol Theme (Bulan / Matahari) */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid ' + (theme === 'dark' ? '#475569' : '#cbd5e1'),
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Tombol Biru Pill */}
        <a 
          href="#peta" 
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span>Connect</span>
          <img 
            src={assets.arrow_icon} 
            alt="arrow" 
            style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} 
          />
        </a>

      </div>

    </nav>
  );
};

export default Navbar;