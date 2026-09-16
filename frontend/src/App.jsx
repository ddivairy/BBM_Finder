import React, { useState } from 'react';
import Navbar from './components/Navbar';

export default function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
      color: theme === 'dark' ? '#ffffff' : '#0f172a'
    }}>
      <Navbar theme={theme} setTheme={setTheme} />
      
      <main style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>How can we help?</h1>
        <p style={{ color: '#64748b' }}>From strategy to execution, we craft digital solution that move your business forward.</p>
      </main>
    </div>
  );
}