import { X } from 'lucide-react';
import { useShipmentDetail } from '../../hooks/useShipments';
import { useUIStore } from '../../store/uiStore';
import { useShipmentStore } from '../../store/shipmentStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ShipmentDrawer = () => {
  const { drawerOpen, setDrawerOpen } = useUIStore();
  const selectedShipmentId = useShipmentStore(state => state.selectedShipmentId);
  const { data: shipment, isLoading } = useShipmentDetail(selectedShipmentId);

  if (!drawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => setDrawerOpen(false)}
      ></div>
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] glass-panel shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-white/50 dark:bg-dark-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Details</h2>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-dark-700 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading || !shipment ? (
             <div className="animate-pulse space-y-6">
               <div className="h-20 bg-gray-100 dark:bg-dark-700 rounded-lg"></div>
               <div className="h-40 bg-gray-100 dark:bg-dark-700 rounded-lg"></div>
               <div className="h-32 bg-gray-100 dark:bg-dark-700 rounded-lg"></div>
             </div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gray-50 dark:bg-dark-700/50 p-4 rounded-xl border border-gray-100 dark:border-dark-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">ID</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-gray-100 font-medium">{shipment.shipment_id}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    shipment.risk_score > 0.6 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                  }`}>
                    Risk: {(shipment.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cargo Class</p>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{shipment.cargo_class}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{shipment.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              {/* SHAP Chart */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Risk Factors (SHAP)</h3>
                <div className="h-48">
                  {shipment.shap_top_factors && shipment.shap_top_factors.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shipment.shap_top_factors} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} width={100} />
                        <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#1f2937', color: '#fff'}} 
                        />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]} maxBarSize={30}>
                          {shipment.shap_top_factors.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#ef4444' : '#22c55e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-gray-300 dark:border-dark-600 rounded-xl text-gray-500 text-sm">
                      No SHAP data available
                    </div>
                  )}
                </div>
              </div>

              {/* Route Options */}
              {shipment.alternate_routes && shipment.alternate_routes.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex justify-between items-center">
                    Alternative Routes
                    <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400 px-2 py-1 rounded">Optimization Available</span>
                  </h3>
                  <div className="space-y-3">
                    {shipment.alternate_routes.map((idx, route) => (
                       <div key={idx} className="border border-gray-200 dark:border-dark-600 rounded-lg p-3 hover:border-brand-500 transition-colors cursor-pointer group flex justify-between items-center">
                         <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{'Route Option ' + (idx + 1)}</p>
                            <p className={`text-xs ${route.eta_delta_min < 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                              ETA: {route.eta_delta_min < 0 ? `${Math.abs(route.eta_delta_min)} min faster` : `+${route.eta_delta_min} min`}
                            </p>
                         </div>
                         <button className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-md group-hover:bg-brand-600 group-hover:text-white transition-colors">
                           Apply
                         </button>
                       </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShipmentDrawer;
