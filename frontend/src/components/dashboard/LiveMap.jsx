import { useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';
import { useShipments } from '../../hooks/useShipments';
import { useMapStore } from '../../store/mapStore';
import { useUIStore } from '../../store/uiStore';
import { useShipmentStore } from '../../store/shipmentStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2x0dummy1234567890dummy\"'; // Required to render mapbox

const LiveMap = () => {
  const { data: shipments } = useShipments();
  const { viewport, setViewport } = useMapStore();
  const { darkMode, setDrawerOpen } = useUIStore();
  const setSelectedShipmentId = useShipmentStore(state => state.setSelectedShipmentId);

  const mapStyle = darkMode 
    ? 'mapbox://styles/mapbox/dark-v11' 
    : 'mapbox://styles/mapbox/light-v11';

  const markers = useMemo(() => {
    if (!shipments) return [];
    return shipments.filter(s => s.status !== 'delivered' && s.current_position).map(shipment => {
      let color = '#22c55e'; // green
      if (shipment.risk_score >= 0.70) color = '#ef4444'; // red
      else if (shipment.risk_score >= 0.40) color = '#f59e0b'; // amber

      return (
        <Marker 
          key={shipment.shipment_id}
          latitude={shipment.current_position.lat} 
          longitude={shipment.current_position.lng}
          anchor="bottom"
          onClick={e => {
            e.originalEvent.stopPropagation();
            setSelectedShipmentId(shipment.shipment_id);
            setDrawerOpen(true);
          }}
        >
          <div 
            className="w-5 h-5 rounded-full border-2 border-white dark:border-dark-800 shadow-md transform transition-transform hover:scale-125 cursor-pointer relative"
            style={{ backgroundColor: color }}
          >
            {shipment.risk_score >= 0.70 && (
              <span className="absolute -inset-1 rounded-full animate-ping opacity-75" style={{ backgroundColor: color }}></span>
            )}
          </div>
        </Marker>
      );
    });
  }, [shipments, setSelectedShipmentId, setDrawerOpen]);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-card shadow-soft relative p-1">
      <div className="w-full h-full rounded-xl overflow-hidden">
        <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {markers}
      </Map>
      </div>
    </div>
  );
};

export default LiveMap;
