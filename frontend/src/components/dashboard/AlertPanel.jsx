import { useMockAlerts, useApproveMockAlert, useDismissMockAlert } from '../../hooks/useMockData';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

const AlertPanel = () => {
  const { data: alerts, isLoading } = useMockAlerts({ status: 'pending' });
  const approveAlert = useApproveMockAlert();
  const dismissAlert = useDismissMockAlert();

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="glass-card rounded-2xl h-[600px] flex flex-col shadow-soft">
      <div className="p-5 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-white/50 dark:bg-dark-800/50 rounded-t-2xl">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertCircle size={18} className="text-brand-500" />
          Live Alerts Feed
        </h3>
        {alerts && alerts.length > 0 && (
          <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
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
            <div key={alert.id} className="bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 p-5 rounded-xl fade-in group relative overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`absolute top-0 left-0 w-1 h-full ${getSeverityColor(alert.severity)}`}></div>
              
              <div className="flex justify-between items-start mb-2 pl-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {alert.shipment_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {formatTimeAgo(alert.created_at)}
                </div>
              </div>
              
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 pl-2 leading-tight">
                {alert.message}
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 pl-2 italic">
                {alert.shap_explanation}
              </p>
              
              <div className="flex gap-2 pl-2">
                <button 
                  onClick={() => approveAlert.mutate(alert.id)}
                  disabled={approveAlert.isPending}
                  className="flex-1 flex items-center justify-center gap-1 bg-white dark:bg-dark-800 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 py-1.5 rounded-md text-xs font-semibold hover:bg-green-50 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button 
                  onClick={() => dismissAlert.mutate(alert.id)}
                  disabled={dismissAlert.isPending}
                  className="flex-1 flex items-center justify-center gap-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400 py-1.5 rounded-md text-xs font-semibold hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
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
