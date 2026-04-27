import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useShipments } from '../../hooks/useShipments';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { useShipmentStore } from '../../store/shipmentStore';

// Component to handle viewport updates when map is moved by user
const MapEvents = ({ setViewport, currentViewport }) => {
  const map = useMap();
  
  useEffect(() => {
    const onMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      setViewport({
        ...currentViewport,
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom
      });
    };
    
    map.on('moveend', onMoveEnd);
    return () => {
      map.off('moveend', onMoveEnd);
    };
  }, [map, setViewport, currentViewport]);
  
  return null;
};

// Component to programmatically change map view based on store state
const MapUpdater = ({ viewport }) => {
  const map = useMap();
  
  useEffect(() => {
    if (viewport && viewport.latitude && viewport.longitude) {
      const center = map.getCenter();
      // Only flyTo if the coordinates are significantly different to avoid jitter loop
      if (Math.abs(center.lat - viewport.latitude) > 0.001 || Math.abs(center.lng - viewport.longitude) > 0.001) {
         map.flyTo([viewport.latitude, viewport.longitude], viewport.zoom || map.getZoom(), {
           animate: true,
           duration: 1.5
         });
      }
    }
  }, [viewport, map]);
  
  return null;
};

const createCustomIcon = (color, isHighRisk) => {
  const pingHtml = isHighRisk 
    ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${color};"></span>`
    : '';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div 
        class="w-5 h-5 rounded-full border-2 border-white dark:border-dark-800 shadow-md transform transition-transform hover:scale-125 cursor-pointer relative"
        style="background-color: ${color};"
      >
        ${pingHtml}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10], // Center the icon
  });
};

const LiveMap = () => {
  const { data: shipments } = useShipments();
  const { viewport, setViewport } = useMapStore();
  const { darkMode, setDrawerOpen } = useUIStore();
  const setSelectedShipmentId = useShipmentStore(state => state.setSelectedShipmentId);

  const markers = useMemo(() => {
    if (!shipments) return [];
    return shipments.filter(s => s.status !== 'delivered' && s.current_position).map(shipment => {
      let color = '#22c55e'; // green
      if (shipment.risk_score >= 0.70) color = '#ef4444'; // red
      else if (shipment.risk_score >= 0.40) color = '#f59e0b'; // amber

      const isHighRisk = shipment.risk_score >= 0.70;
      const icon = createCustomIcon(color, isHighRisk);

      return (
        <Marker 
          key={shipment.shipment_id}
          position={[shipment.current_position.lat, shipment.current_position.lng]}
          icon={icon}
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e.originalEvent);
              setSelectedShipmentId(shipment.shipment_id);
              setDrawerOpen(true);
            },
          }}
        />
      );
    });
  }, [shipments, setSelectedShipmentId, setDrawerOpen]);

  // Center coordinate handling
  const center = viewport?.latitude && viewport?.longitude 
    ? [viewport.latitude, viewport.longitude] 
    : [20.5937, 78.9629]; // Default center (India)
    
  const zoom = viewport?.zoom || 4;

  return (
    <div className={`w-full h-[600px] rounded-2xl overflow-hidden glass-card shadow-soft relative p-1 ${darkMode ? 'dark-map' : ''}`}>
      <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className={darkMode ? 'map-tiles-dark' : ''}
          />
          {markers}
          <MapEvents setViewport={setViewport} currentViewport={viewport} />
          <MapUpdater viewport={viewport} />
        </MapContainer>
      </div>
      
      {/* CSS for custom markers and dark mode filter */}
      <style>{`
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
        /* Filter to invert and adjust OSM tiles for dark mode */
        .map-tiles-dark {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-container {
          background: ${darkMode ? '#1f2937' : '#f3f4f6'} !important;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LiveMap;
