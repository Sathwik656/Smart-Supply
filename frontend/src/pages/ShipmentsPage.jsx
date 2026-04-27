import { useState } from 'react';
import { useShipments } from '../hooks/useShipments';
import { Filter, Search } from 'lucide-react';

const ShipmentsPage = () => {
  const [filter, setFilter] = useState('all');
  const { data: shipments, isLoading } = useShipments(filter !== 'all' ? { status: filter } : {});

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Shipments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all logistics deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search ID..." className="pl-9 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-dark-800 text-sm w-48 text-gray-900 dark:text-white" />
          </div>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="pl-3 pr-8 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-dark-800 text-sm text-gray-900 dark:text-white appearance-none"
          >
            <option value="all">All Status</option>
            <option value="on_time">On Time</option>
            <option value="at_risk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-soft overflow-hidden fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-dark-700">
                <th className="px-6 py-4 font-semibold">Shipment ID</th>
                <th className="px-6 py-4 font-semibold">Cargo</th>
                <th className="px-6 py-4 font-semibold">Risk Score</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {isLoading ? (
                 <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-400">Loading data...</td></tr>
              ) : shipments && shipments.length > 0 ? (
                shipments.map(s => (
                  <tr key={s.shipment_id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-brand-600 dark:text-brand-400">{s.shipment_id}</span>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize text-gray-700 dark:text-gray-300">{s.cargo_class}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                           <div className={`h-full ${s.risk_score > 0.6 ? 'bg-red-500' : s.risk_score > 0.3 ? 'bg-amber-500' : 'bg-green-500'}`} style={{width: `${s.risk_score * 100}%`}}></div>
                         </div>
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{(s.risk_score * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                        s.status === 'on_time' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 
                        s.status === 'delayed' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>
                        {s.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(s.eta_revised || s.eta_original).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                 <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No shipments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShipmentsPage;
