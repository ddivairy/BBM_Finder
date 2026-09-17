import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix icon default Leaflet yang sering loss di React/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Helper untuk menggeser pusat peta saat ada lokasi yang dipilih
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function MapView({ lokasiList, selectedLokasi, userLocation, onSelectLokasi, theme}) {
  // Default koordinat (Bandung) jika belum ada yang dipilih
  const defaultCenter = [-6.9174, 107.6191];
  const activeCenter = selectedLokasi 
    ? [parseFloat(selectedLokasi.lintang), parseFloat(selectedLokasi.bujur)] 
    : userLocation
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

  return (
  <div className="w-full h-full relative z-0 rounded-2xl overflow-hidden">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="w-full h-full"
        zoomControl={false}
      >
       <ChangeView center={selectedLokasi || userLocation ? activeCenter : null} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold">Lokasi Saya</p>
              <p className="text-xs text-gray-500">
                Posisi kamu saat ini
              </p>
            </div>
          </Popup>
        </Marker>
      )}

        {lokasiList.map((item) => (
          <Marker 
            key={item.id} 
            position={[parseFloat(item.lintang), parseFloat(item.bujur)]}
            eventHandlers={{
              click: () => onSelectLokasi(item),
            }}
          >
            <Popup>
              <div className="p-1 max-w-xs">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1 ${
                  item.kategori === 'spbu' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.kategori}
                </span>
                <h3 className="font-bold text-sm leading-tight text-gray-900">{item.nama}</h3>
                <p className="text-xs text-gray-600 mt-1">{item.alamat || 'Alamat tidak tersedia'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tipe_bensin.map((b, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded border">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}