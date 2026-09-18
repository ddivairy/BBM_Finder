
import {MapPin} from 'lucide-react';

export default function LocationList({ lokasiList, loading, selectedLokasi, onSelectLokasi }) {
  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Memuat data lokasi...</div>;
  }

  if (lokasiList.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 border border-dashed rounded-xl bg-white dark:bg-gray-800">
        Tidak ada lokasi BBM ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-3 h-[460px] overflow-y-auto pr-2 pb-4 scrollbar-thin">
      {lokasiList.map((item) => (
        <div 
        key={item.id}
        onClick={() => onSelectLokasi(item)}
        className={`p-4 bg-white dark:bg-gray-800 rounded-xl border transition cursor-pointer hover:shadow-md ${
            selectedLokasi?.id === item.id 
            ? 'border-red-500' 
            : 'border-gray-200 dark:border-gray-700'
        }`}
        >
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            {item.nama}
            </h3>

            {item.jarak !== null && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <MapPin className="w-3 h-3 text-red-500 dark:text-red-400 shrink-0" />
                {item.jarak < 1
                  ? `${Math.round(item.jarak * 1000)} m`
                  : `${item.jarak.toFixed(1)} km`}
              </span>
            )}

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                item.kategori === 'spbu'
                  ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/40'
                  : 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/40'
              }`}
            >
              {item.kategori === 'spbu' ? 'SPBU' : 'BBM eceran'}
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.alamat || 'Alamat belum diatur'}</p>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-1">
              {item.tipe_bensin.map((bensin, idx) => (
                <span 
                  key={idx} 
                  className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:border dark:border-gray-600/50 px-2 py-0.5 rounded"
                >
                  {bensin}
                </span>
              ))}
            </div>
            
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();

                    if (!item.lintang || !item.bujur) return;

                    window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${item.lintang},${item.bujur}`,
                    '_blank'
                    );
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
                >
                Lihat rute &rarr;
            </button>
          </div>
        </div>
      ))}
      
    </div>
  );
}