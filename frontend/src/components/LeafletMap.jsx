import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

const AQI_COLORS = {
  good: '#16a34a',
  satisfactory: '#65a30d',
  moderate: '#d97706',
  poor: '#ea580c',
  verypoor: '#dc2626',
  severe: '#7f1d1d',
};

function getAqiColor(aqi) {
  if (!aqi) return '#94a3b8';
  if (aqi <= 50) return AQI_COLORS.good;
  if (aqi <= 100) return AQI_COLORS.satisfactory;
  if (aqi <= 200) return AQI_COLORS.moderate;
  if (aqi <= 300) return AQI_COLORS.poor;
  if (aqi <= 400) return AQI_COLORS.verypoor;
  return AQI_COLORS.severe;
}

export default function LeafletMap({ 
  stations = [], 
  selectedStationId = null, 
  onSelectStation = null,
  activeFilter = 'all' // 'all' | 'hotspots' | 'pm25' | 'no2'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Filter stations based on selection
  const filteredStations = stations.filter(st => {
    if (activeFilter === 'hotspots') {
      return (st.aqi || 0) >= 250;
    }
    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map centered on Delhi NCR
      const map = L.map(mapContainerRef.current, {
        center: [28.6400, 77.2000],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap contributors | AirGuard AI' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    // Add updated station markers
    filteredStations.forEach(st => {
      const isSelected = st.station_id === selectedStationId;
      const color = getAqiColor(st.aqi);
      const isHotspot = (st.aqi || 0) >= 300;

      // Custom HTML Marker Pin
      const iconHtml = `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '36px' : '28px'};
          height: ${isSelected ? '36px' : '28px'};
          border-radius: 50%;
          border: 3px solid ${isSelected ? '#0f172a' : '#ffffff'};
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '12px' : '10px'};
          font-family: Inter, sans-serif;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${Math.round(st.aqi || 0)}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-aqi-marker',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: Inter, sans-serif; padding: 4px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${st.station_name || st.name}</span>
            <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569;">${st.agency || 'CPCB'}</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${st.station_type || st.type || 'Urban'}</div>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748b;">Current AQI:</span>
              <strong style="color: ${color}; font-size: 12px;">${Math.round(st.aqi || 0)} (${st.category || 'Moderate'})</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #64748b;">Dominant Pollutant:</span>
              <span style="font-weight: 600; color: #0f172a;">${st.dominant_pollutant || 'PM2.5'}</span>
            </div>
          </div>
          
          <button id="btn-${st.station_id}" style="
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            padding: 5px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">
            Select Station
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${st.station_id}`);
        if (btn && onSelectStation) {
          btn.onclick = () => {
            onSelectStation(st.station_id);
            map.closePopup();
          };
        }
      });

      marker.on('click', () => {
        if (onSelectStation) {
          onSelectStation(st.station_id);
        }
      });

      markersRef.current[st.station_id] = marker;
    });

  }, [filteredStations, selectedStationId]);

  // Center on selected station if changed
  useEffect(() => {
    if (selectedStationId && mapInstanceRef.current && markersRef.current[selectedStationId]) {
      const marker = markersRef.current[selectedStationId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.8 });
    }
  }, [selectedStationId]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-base-200 shadow-soft bg-white">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Map Legend Floating Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-base-200 shadow-card text-[11px] max-w-[210px]">
        <div className="font-bold text-base-800 mb-2">CPCB AQI Scale (India)</div>
        <div className="grid grid-cols-2 gap-1.5 font-medium">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" /><span>Good (0-50)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#65a30d]" /><span>Satisfactory (51-100)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" /><span>Moderate (101-200)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" /><span>Poor (201-300)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" /><span>Very Poor (301-400)</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" /><span>Severe (401-500)</span></div>
        </div>
      </div>
    </div>
  );
}
