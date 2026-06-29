import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BranchDirectoryConfig, BranchLocation } from '../../data/seedData';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';

// Fix for default Leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom colored markers
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

interface MapControllerProps {
  branches: BranchLocation[];
  config: BranchDirectoryConfig;
  selectedBranchId?: string | null;
}

const MapController: React.FC<MapControllerProps> = ({ branches, config, selectedBranchId }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedBranchId) {
      const branch = branches.find(b => b.id === selectedBranchId);
      if (branch) {
        map.flyTo([branch.lat, branch.lng], 15, { duration: 1.5 });
      }
    } else if (config.mapSettings.autoFitBranches && branches.length > 0) {
      const bounds = L.latLngBounds(branches.map(b => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: config.mapSettings.maxZoom });
    } else {
      map.setView(
        [config.mapSettings.defaultCenter.lat, config.mapSettings.defaultCenter.lng],
        config.mapSettings.defaultZoom
      );
    }
  }, [map, branches, config.mapSettings, selectedBranchId]);

  return null;
};

interface LiveBranchMapProps {
  config: BranchDirectoryConfig;
  editMode?: boolean;
  onPinDragEnd?: (branchId: string, lat: number, lng: number) => void;
  selectedBranchId?: string | null;
  onBranchClick?: (branchId: string) => void;
  className?: string;
}

export const LiveBranchMap: React.FC<LiveBranchMapProps> = ({
  config,
  editMode = false,
  onPinDragEnd,
  selectedBranchId,
  onBranchClick,
  className = "w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-0"
}) => {
  const activeBranches = config.branches.filter(b => b.active || editMode); // Show inactive in edit mode

  const tileUrl = config.mapSettings.mapTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : config.mapSettings.mapTheme === 'light'
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'; // Satellite

  const renderMarkers = () => {
    return activeBranches.map(branch => {
      const isSelected = selectedBranchId === branch.id;
      const iconColor = branch.pinColor || (isSelected ? '#00f0ff' : (config.mapSettings.mapTheme === 'dark' ? '#ffffff' : '#333333'));
      const icon = createCustomIcon(iconColor);

      return (
        <Marker
          key={branch.id}
          position={[branch.lat, branch.lng]}
          icon={icon}
          draggable={editMode}
          eventHandlers={{
            click: () => onBranchClick?.(branch.id),
            dragend: (e) => {
              if (editMode && onPinDragEnd) {
                const marker = e.target;
                const position = marker.getLatLng();
                onPinDragEnd(branch.id, position.lat, position.lng);
              }
            }
          }}
        >
          <Popup className="branch-popup z-50">
            <div className="p-1 min-w-[200px]">
              {branch.imageUrl && (
                <img src={branch.imageUrl} alt={branch.name} className="w-full h-24 object-cover rounded-md mb-3" />
              )}
              <h3 className="font-bold text-lg mb-1 leading-tight text-gray-900">{branch.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{branch.branchCode} • {branch.district}, {branch.state}</p>
              
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={14} className="text-blue-500 mt-1 shrink-0" />
                  <span className="leading-tight">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone size={14} className="text-green-500 shrink-0" />
                  <span>{branch.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock size={14} className="text-orange-500 shrink-0" />
                  <span>{branch.workingHours}</span>
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-sm font-semibold ${branch.businessStatus === 'Open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {branch.businessStatus}
                  </span>
                </div>
              </div>
              
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-1.5 rounded-md text-sm font-semibold transition-colors mt-2"
              >
                <Navigation size={14} />
                Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className={className} style={{ isolation: 'isolate' }}>
      <MapContainer
        center={[config.mapSettings.defaultCenter.lat, config.mapSettings.defaultCenter.lng]}
        zoom={config.mapSettings.defaultZoom}
        minZoom={config.mapSettings.minZoom}
        maxZoom={config.mapSettings.maxZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {config.mapSettings.showClusterPins ? (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
            {renderMarkers()}
          </MarkerClusterGroup>
        ) : (
          renderMarkers()
        )}

        <MapController branches={activeBranches} config={config} selectedBranchId={selectedBranchId} />
      </MapContainer>
      
      {editMode && (
        <div className="absolute top-4 right-4 z-[400] bg-black/80 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none">
          Edit Mode: Drag pins to update locations
        </div>
      )}
    </div>
  );
};
