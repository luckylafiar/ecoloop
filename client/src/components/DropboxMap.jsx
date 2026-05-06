// src/components/DropboxMap.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom HTML icon agar match palette terracotta
const dropboxIcon = (selected = false) => L.divIcon({
  className: 'custom-dropbox-marker',
  html: `<div class="dropbox-marker" ${
    selected ? 'style="background:#1F2A1C;"' : ''
  }></div><style>.custom-dropbox-marker > .dropbox-marker::after{${
    selected ? 'border-top-color:#1F2A1C;' : ''
  }}</style>`,
  iconSize: [28, 36],
  iconAnchor: [14, 32],
  popupAnchor: [0, -28],
});

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 0.8 });
  }, [center, map]);
  return null;
}

export default function DropboxMap({
  center = [-6.8915, 107.6107],   // ITB Ganesha default
  dropboxes = [],
  selectedId = null,
  onSelect = () => {},
  height = 320,
}) {
  return (
    <div style={{
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      border: '1px solid var(--c-line-strong)',
      height,
    }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo center={center} />
        {dropboxes.map((d) => (
          <Marker
            key={d.id}
            position={[Number(d.latitude), Number(d.longitude)]}
            icon={dropboxIcon(d.id === selectedId)}
            eventHandlers={{ click: () => onSelect(d) }}
          >
            <Popup className="dropbox-popup">
              <div style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--c-ink)',
                marginBottom: '0.4rem',
              }}>
                {d.name}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--c-ink-soft)',
                marginBottom: '0.4rem',
              }}>
                {d.address}
              </div>
              {d.distance_km !== undefined && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--c-ink-mute)',
                  marginBottom: '0.5rem',
                }}>
                  {Number(d.distance_km).toFixed(2)} km dari Anda
                </div>
              )}
              <button
                onClick={() => onSelect(d)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: 'var(--c-accent-deep)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--c-accent)',
                  padding: '2px 0',
                  cursor: 'pointer',
                }}
              >
                Pilih lokasi ini →
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
