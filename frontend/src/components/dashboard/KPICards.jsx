import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Package, Activity, AlertTriangle, Clock } from 'lucide-react';

const KPICards = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics_summary'],
    queryFn: async () => {
      const res = await api.get('/analytics/summary');
      return res.data;
    },
    refetchInterval: 60000,
  });

  const cards = [
    { title: 'On-Time Rate', value: data?.on_time_rate ? `${data.on_time_rate}%` : '---', icon: <Activity className="text-green-500" />, color: 'bg-green-100 dark:bg-green-900/30' },
    { title: 'Active Shipments', value: data?.active_shipments || '---', icon: <Package className="text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Open Alerts', value: data?.open_alerts || '---', icon: <AlertTriangle className="text-red-500" />, color: 'bg-red-100 dark:bg-red-900/30' },
    { title: 'Avg Delay (Min)', value: data?.avg_delay_minutes || '---', icon: <Clock className="text-orange-500" />, color: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6 flex items-center gap-5 fade-in relative overflow-hidden group hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-100/50 to-transparent dark:from-white/5 rounded-bl-full z-0 group-hover:scale-110 transition-transform duration-300"></div>
          <div className={`p-4 rounded-xl z-10 shadow-sm ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {isLoading ? <div className="h-8 w-16 bg-gray-200 dark:bg-dark-700 animate-pulse rounded"></div> : card.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
