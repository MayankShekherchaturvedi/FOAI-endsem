import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ISS Icon
const issIcon = new L.DivIcon({
  className: 'custom-iss-icon',
  html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); display: flex; align-items: center; justify-content: center;"><span style="color:white; font-size: 12px;">🚀</span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to recenter map when ISS moves
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const ISSMap = ({ position, trajectory }) => {
  if (!position) {
    return (
      <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center border border-slate-200 dark:border-slate-700">
        <span className="text-slate-400">Loading Map Data...</span>
      </div>
    );
  }

  const center = [position.lat, position.lng];
  
  // Format trajectory for Polyline [[lat, lng], [lat, lng]]
  const pathCoordinates = trajectory.map(pos => [pos.lat, pos.lng]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 h-[450px] relative z-0">
      <div className="absolute top-6 left-6 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        LIVE TRACKING
      </div>
      
      <MapContainer 
        center={center} 
        zoom={4} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <Polyline 
          positions={pathCoordinates} 
          color="#3b82f6" 
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
        />
        
        <Marker position={center} icon={issIcon}>
          <Popup className="dark:text-slate-900">
            <strong>International Space Station</strong><br />
            Lat: {position.lat.toFixed(4)}<br />
            Lng: {position.lng.toFixed(4)}<br />
            Speed: {position.speed ? position.speed.toFixed(0) : '---'} km/h
          </Popup>
        </Marker>
        <MapRecenter center={center} />
      </MapContainer>
    </div>
  );
};

export default ISSMap;
