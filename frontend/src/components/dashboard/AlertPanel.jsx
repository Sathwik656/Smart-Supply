import { useAlerts, useApproveAlert, useDismissAlert } from '../../hooks/useAlerts';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const AlertPanel = () => {
  const { data: alerts, isLoading } = useAlerts({ status: 'pending' });
  const approveAlert = useApproveAlert();
  const dismissAlert = useDismissAlert();

  return (
    <div className="glass-card rounded-2xl h-[600px] flex flex-col shadow-soft">
      <div className="p-5 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-white/50 dark:bg-dark-800/50 rounded-t-2xl">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle size={18} className="text-brand-500" />
          Live Alerts Feed
        </h3>
        {alerts && alerts.length > 0 && (
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">
            {alerts.length} New
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-dark-700 rounded-lg"></div>
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          alerts.map(alert => (
            <div key={alert._id || alert.id} className="bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 p-5 rounded-xl fade-in group relative overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`absolute top-0 left-0 w-1 h-full ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Shipment {alert.shipment_id.substring(0, 8)}...
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                }`}>
                  {alert.severity}
                </span>
              </div>
              
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 pl-2 leading-tight">
                {alert.message}
              </p>
              
              <div className="flex gap-2 pl-2">
                <button 
                  onClick={() => approveAlert.mutate(alert._id || alert.id)}
                  disabled={approveAlert.isPending}
                  className="flex-1 flex items-center justify-center gap-1 bg-white dark:bg-dark-800 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 py-1.5 rounded-md text-xs font-semibold hover:bg-green-50 dark:hover:bg-green-900/40 transition-colors"
                >
                  <CheckCircle size={14} /> Approve Setup
                </button>
                <button 
                  onClick={() => dismissAlert.mutate(alert._id || alert.id)}
                  disabled={dismissAlert.isPending}
                  className="flex-1 flex items-center justify-center gap-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                >
                  <XCircle size={14} /> Dismiss
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-2">
            <CheckCircle size={32} className="opacity-50" />
            <p className="text-sm">No pending alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
