import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { CrimeRecord, CrimeCategory } from '../types';
import { getCategoryColor, getSeverityBadgeProps } from '../utils/colors';
import { formatDate, formatHour } from '../utils/formatters';
import { Layers, Eye, EyeOff, MapPin, AlertTriangle } from 'lucide-react';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface CrimeMapProps {
  crimes?: CrimeRecord[];
  markers?: CrimeRecord[];
  selectedCrime?: CrimeRecord | null;
  onSelectCrime?: (crime: CrimeRecord | null) => void;
  onSelectMarker?: (crime: CrimeRecord) => void;
  height?: string;
  showControls?: boolean;
}

export const CrimeMap: React.FC<CrimeMapProps> = ({
  crimes,
  markers,
  selectedCrime,
  onSelectCrime,
  onSelectMarker,
  height = '600px',
  showControls = true,
}) => {
  const activeCrimes = crimes || markers || [];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  const [tileMode, setTileMode] = useState<'dark' | 'standard'>('dark');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Geographic center of Andhra Pradesh (~Guntur region)
    const initialLat = activeCrimes.length > 0 ? activeCrimes[0].latitude : 16.0;
    const initialLng = activeCrimes.length > 0 ? activeCrimes[0].longitude : 80.0;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: activeCrimes.length > 0 ? 10 : 7,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const standardTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileUrl = tileMode === 'dark' ? darkTileUrl : standardTileUrl;
    const attribution =
      tileMode === 'dark'
        ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        : '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
      subdomains: 'abcd',
    });

    tileLayer.addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tileLayer);
      }
    };
  }, [tileMode]);

  // Update Markers & Heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatLayerRef.current.clearLayers();

    if (activeCrimes.length === 0) return;

    const bounds = L.latLngBounds([]);

    // 1. Render True Gradient Heatmap
    if (showHeatmap) {
      const heatData = activeCrimes.map((crime) => {
        // Adjust intensity based on severity
        const intensity =
          crime.severity === 'CRITICAL'
            ? 1.0
            : crime.severity === 'HIGH'
            ? 0.8
            : crime.severity === 'MEDIUM'
            ? 0.5
            : 0.3;
        return [crime.latitude, crime.longitude, intensity];
      });

      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 18,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.2: '#3b82f6', // blue
          0.4: '#10b981', // emerald
          0.6: '#eab308', // yellow
          0.8: '#f97316', // orange
          1.0: '#ef4444', // red
        },
      });

      heatLayerRef.current?.addLayer(heatLayer);
    }

    // 2. Render Markers
    if (showMarkers) {
      // Optimize to 150 markers to ensure instant DOM rendering and 60fps interaction
      const markersToRender = activeCrimes.slice(0, 150);
      markersToRender.forEach((crime) => {
        bounds.extend([crime.latitude, crime.longitude]);

        const color = getCategoryColor(crime.crimeCategory);
        const severityProps = getSeverityBadgeProps(crime.severity);
        const isSelected = selectedCrime?.caseId === crime.caseId;

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-transform ${
              isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
            }" style="background-color: ${color};">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            ${
              isSelected
                ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-crime-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([crime.latitude, crime.longitude], { icon: customIcon });

        const popupContent = `
          <div class="p-3 min-w-[240px] text-slate-900 font-sans">
            <div class="flex items-center justify-between gap-2 border-b pb-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style="background-color: ${color};">
                ${crime.crimeCategory}
              </span>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded border ${severityProps.border}" style="color: ${severityProps.badgeBg};">
                ${crime.severity}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-900">${crime.crimeType}</h4>
            <p class="text-xs text-slate-600 mt-1">${crime.locationName}</p>
            <p class="text-xs text-slate-500 font-medium">${crime.district}, ${crime.city}</p>
            
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>${formatDate(crime.date)}</span>
              <span class="font-semibold">${formatHour(crime.hour)}</span>
            </div>
            <div class="mt-1 text-[10px] text-slate-400 font-mono">
              ID: ${crime.caseId}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'crime-leaflet-popup',
        });

        marker.on('click', () => {
          if (onSelectCrime) onSelectCrime(crime);
          if (onSelectMarker) onSelectMarker(crime);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    if (bounds.isValid() && activeCrimes.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [activeCrimes, showHeatmap, showMarkers]);

  useEffect(() => {
    if (selectedCrime && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCrime.latitude, selectedCrime.longitude], 15, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedCrime]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/90 shadow-2xl text-xs text-slate-200">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-400 pb-1.5 border-b border-slate-800">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Map Layers</span>
          </div>

          <button
            type="button"
            onClick={() => setShowMarkers(!showMarkers)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showMarkers ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              Pins & Markers
            </span>
            {showMarkers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showHeatmap ? 'bg-indigo-600/20 text-indigo-300 font-medium' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Density Rings
            </span>
            {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">Theme</span>
            <div className="flex bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setTileMode('dark')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  tileMode === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTileMode('standard')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  tileMode === 'standard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800/90 shadow-2xl max-w-[280px] hidden sm:block max-h-[250px] overflow-y-auto custom-scrollbar">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 sticky top-0 bg-slate-900/90 backdrop-blur-md pb-1 z-20">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Category Reference
        </h4>
        <div className="flex flex-col gap-1.5 text-[10px] text-slate-300">
          {[
            'Murder',
            'Rape',
            'Kidnapping (Women & Girls)',
            'Kidnapping (Others)',
            'Dowry Deaths',
            'Molestation & Harassment',
            'Dacoity',
            'Robbery',
            'Burglary',
            'Theft',
            'Riots',
            'Cheatings',
            'Other IPC Crimes',
            'Other Crimes',
          ].map((cat) => (
            <div key={cat} className="flex items-center gap-2 w-full truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(cat as CrimeCategory) }} />
              <span className="truncate">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
