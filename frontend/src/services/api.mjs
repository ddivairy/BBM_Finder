const API_URL = '/api';

export const api = {
  // 1. Fetch lokasi (bisa pakai query param kategori)
  getLokasi: async (kategori = '') => {
    const url = kategori && kategori !== 'semua' 
      ? `${API_URL}/lokasi?kategori=${kategori}` 
      : `${API_URL}/lokasi`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Gagal mengambil data lokasi');
    return res.json();
  },

  // 2. Tambah lokasi baru
  tambahLokasi: async (dataLokasi) => {
    const res = await fetch(`${API_URL}/lokasi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataLokasi),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menambahkan lokasi');
    return data;
  },

  // 3. Update lokasi / verifikasi
  updateLokasi: async (id, dataLokasi) => {
    const res = await fetch(`${API_URL}/lokasi/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataLokasi),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui lokasi');
    return data;
  },

  // 4. Hapus lokasi
  hapusLokasi: async (id) => {
    const res = await fetch(`${API_URL}/lokasi/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menghapus lokasi');
    return data;
  }
};