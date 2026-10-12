export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export const api = {
  // Dapetin lokasi
  getLokasi: async (kategori = '') => {
    const url = kategori && kategori !== 'semua'
      ? `${API_URL}/lokasi?kategori=${kategori}`
      : `${API_URL}/lokasi`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('Gagal mengambil data lokasi');
    }

    return res.json();
  },

  // Tambah lokasi
  tambahLokasi: async (dataLokasi) => {
    const res = await fetch(`${API_URL}/lokasi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataLokasi),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal menambahkan lokasi');
    }

    return data;
  },

  // Update lokasi
  updateLokasi: async (id, dataLokasi) => {
    const res = await fetch(`${API_URL}/lokasi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataLokasi),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memperbarui lokasi');
    }

    return data;
  },

  // Hapus lokasi
  hapusLokasi: async (id) => {
    const res = await fetch(`${API_URL}/lokasi/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal menghapus lokasi');
    }

    return data;
  },

  // ---- Laporan keramaian ----

  // Ambil semua laporan aktif (2 jam terakhir)
  getLaporan: async (token) => {
    const res = await fetch(`${API_URL}/laporan`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal mengambil laporan');
    }

    return data;
  },

  // Kirim laporan sepi/normal/ramai untuk suatu lokasi
  kirimLaporan: async (lokasiId, { status, komentar }, token) => {
    const res = await fetch(`${API_URL}/laporan/lokasi/${lokasiId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, komentar }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal mengirim laporan');
    }

    return data;
  },

  // Like / unlike sebuah laporan
  likeLaporan: async (laporanId, token) => {
    const res = await fetch(`${API_URL}/laporan/${laporanId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memproses like');
    }

    return data;
  },

  // ---- Komunitas Pengecer Bensin ----

  // Info hari ini (berlaku sampai tengah malam WIB)
  getInfoPengecer: async (token) => {
    const res = await fetch(`${API_URL}/info`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal mengambil info');
    }

    return data;
  },

  // Posting info pengecer
  kirimInfoPengecer: async ({ teks, lokasi_id, tempat }, token) => {
    const res = await fetch(`${API_URL}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teks, lokasi_id, tempat }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memposting info');
    }

    return data;
  },

  // Like / unlike info pengecer
  likeInfoPengecer: async (infoId, token) => {
    const res = await fetch(`${API_URL}/info/${infoId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memproses like');
    }

    return data;
  },

  dislikeInfoPengecer: async (infoId, token) => {
    const res = await fetch(`${API_URL}/info/${infoId}/dislike`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Gagal memproses dislike');
    }

    return data;
  }
};
