import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useLokasi(userLocation) {
  const [lokasiList, setLokasiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterKategori, setFilterKategori] = useState('semua');
  const [filterJarak, setFilterJarak] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const hitungJarak = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radius bumi dalam km

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


  // Helper parsing JSON tipe_bensin safe
  const parseTipeBensin = (raw) => {
  if (!raw) return [];

  let data = raw;

  if (!Array.isArray(data)) {
    try {
      data = JSON.parse(data);
    } catch {
      data = [data];
    }
  }

  return data.flatMap(item =>
    String(item)
      .split(',')
      .map(tipe => tipe.trim())
      .filter(Boolean)
  );
};

  const fetchLokasi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLokasi(filterKategori);
      // Format data bensin agar aman diproses frontend
      const formatted = data
      .map(item => {
        const jarak = userLocation
          ? hitungJarak(
              userLocation.lat,
              userLocation.lng,
              parseFloat(item.lintang),
              parseFloat(item.bujur)
            )
          : null;

        return {
          ...item,
          kategori: item.kategori.toLowerCase(),
          tipe_bensin: parseTipeBensin(item.tipe_bensin),
          jarak
        };
      })
      .sort((a, b) => {
        if (a.jarak === null) return 1;
        if (b.jarak === null) return -1;
        return a.jarak - b.jarak;
      });
      setLokasiList(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterKategori, userLocation]);

  useEffect(() => {
    fetchLokasi();
  }, [fetchLokasi]);

  // Filter pencarian nama / alamat di frontend
  const filteredLokasi = lokasiList.filter(item => {
    const query = searchQuery.toLowerCase();

    const matchNama = item.nama.toLowerCase().includes(query);

    const matchAlamat = (item.alamat || '').toLowerCase().includes(query);

    const matchBensin = item.tipe_bensin.some(bensin =>
      bensin.toLowerCase().includes(query)
    );

    const matchJarak =
      filterJarak === 'semua' ||
      (item.jarak !== null && item.jarak <= Number(filterJarak));

    return (matchNama || matchAlamat || matchBensin) && matchJarak;
  });

  return {
    lokasiList: filteredLokasi,
    loading,
    error,
    filterKategori,
    filterJarak,
    setFilterJarak,
    setFilterKategori,
    searchQuery,
    setSearchQuery,
    refetch: fetchLokasi,
  };
}