import React from 'react';

export default function FilterKategori({
  filterKategori,
  setFilterKategori,
  filterJarak,
  setFilterJarak,
  userLocation
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">

      {/* Filter Kategori */}
      {[
        { id: 'semua', label: 'Semua' },
        { id: 'spbu', label: 'SPBU' },
        { id: 'eceran', label: 'BBM eceran' }
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
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

      {/* Filter Jarak */}
      <select
        value={filterJarak}
        onChange={(e) => setFilterJarak(e.target.value)}
        disabled={!userLocation}
        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 outline-none cursor-pointer disabled:opacity-50"
      >
        <option value="semua">Semua jarak</option>
        <option value="1">≤ 1 km</option>
        <option value="3">≤ 3 km</option>
        <option value="5">≤ 5 km</option>
      </select>

    </div>
  );
}

