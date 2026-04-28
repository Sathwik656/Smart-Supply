import { useMockVehicles, useMockVehicleDetail } from '../hooks/useMockData';
import { Truck, MapPin, Phone, Fuel, Gauge, Clock, Package, Wrench, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400',
    idle: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400',
    maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
  };
  
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] || styles.idle}`}>
      {status?.toUpperCase()}
    </span>
  );
};

const VehicleCard = ({ vehicle, onClick, isSelected }) => (
  <div 
    onClick={() => onClick(vehicle)}
    className={`bg-white dark:bg-dark-700 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${
      isSelected 
        ? 'border-brand-500 shadow-md ring-2 ring-brand-500/20' 
        : 'border-gray-100 dark:border-dark-600'
    }`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
          <Truck size={20} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{vehicle.vehicle_id}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.vehicle_type}</p>
        </div>
      </div>
      <StatusBadge status={vehicle.status} />
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <Phone size={12} />
        <span>{vehicle.driver_name}</span>
      </div>
      {vehicle.current_shipment && (
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Package size={12} />
          <span>{vehicle.current_shipment}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <MapPin size={12} />
        <span>{vehicle.destination || 'No destination'}</span>
      </div>
    </div>
    
    {vehicle.status === 'active' && (
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-600 flex justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-500">
          <Fuel size={12} className="text-green-500" />
          <span>{vehicle.fuel_level}%</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Gauge size={12} className="text-blue-500" />
          <span>{vehicle.speed_kmh} km/h</span>
        </div>
      </div>
    )}
  </div>
);

const VehicleDetailPanel = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-dark-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Truck size={24} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{vehicle.vehicle_id}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.vehicle_type}</p>
              </div>
            </div>
            <StatusBadge status={vehicle.status} />
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Driver</p>
              <p className="font-medium text-gray-900 dark:text-white">{vehicle.driver_name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
              <p className="font-medium text-gray-900 dark:text-white">{vehicle.driver_phone}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Location</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {vehicle.current_lat?.toFixed(4)}, {vehicle.current_lng?.toFixed(4)}
            </p>
          </div>
          
          {vehicle.status === 'active' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fuel Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${vehicle.fuel_level < 20 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${vehicle.fuel_level}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.fuel_level}%</span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Speed</p>
                  <p className="font-medium text-gray-900 dark:text-white">{vehicle.speed_kmh} km/h</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shipment Info</p>
                <p className="font-medium text-gray-900 dark:text-white">{vehicle.current_shipment || 'No active shipment'}</p>
                {vehicle.destination && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Destination: {vehicle.destination}</p>
                )}
                {vehicle.eta && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={12} />
                    ETA: {new Date(vehicle.eta).toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distance Traveled</p>
                  <p className="font-medium text-gray-900 dark:text-white">{vehicle.total_distance_km} km</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                  <p className="font-medium text-gray-900 dark:text-white">{vehicle.remaining_distance_km} km</p>
                </div>
              </div>
            </>
          )}
          
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Ping</p>
            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={14} />
              {vehicle.last_ping_at ? new Date(vehicle.last_ping_at).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-dark-700 flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const VehiclesPage = () => {
  const { data: vehicles, isLoading } = useMockVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const filteredVehicles = vehicles?.filter(v => 
    statusFilter === 'all' || v.status === statusFilter
  ) || [];
  
  const statusCounts = {
    all: vehicles?.length || 0,
    active: vehicles?.filter(v => v.status === 'active').length || 0,
    idle: vehicles?.filter(v => v.status === 'idle').length || 0,
    maintenance: vehicles?.filter(v => v.status === 'maintenance').length || 0
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Fleet Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor and manage your vehicle fleet in real-time</p>
      </div>
      
      {/* Status Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${statusFilter === 'all' ? 'ring-2 ring-brand-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <Truck size={20} className="text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.all}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Vehicles</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setStatusFilter('active')}
          className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${statusFilter === 'active' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.active}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setStatusFilter('idle')}
          className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${statusFilter === 'idle' ? 'ring-2 ring-gray-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
              <Clock size={20} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.idle}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Idle</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => setStatusFilter('maintenance')}
          className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 ${statusFilter === 'maintenance' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Wrench size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusCounts.maintenance}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-gray-100 dark:bg-dark-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.vehicle_id} 
              vehicle={vehicle} 
              onClick={setSelectedVehicle}
              isSelected={selectedVehicle?.vehicle_id === vehicle.vehicle_id}
            />
          ))}
        </div>
      )}
      
      {filteredVehicles.length === 0 && !isLoading && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Truck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No vehicles found with this status</p>
        </div>
      )}
      
      {/* Vehicle Detail Modal */}
      <VehicleDetailPanel 
        vehicle={selectedVehicle} 
        onClose={() => setSelectedVehicle(null)} 
      />
    </div>
  );
};

export default VehiclesPage;
