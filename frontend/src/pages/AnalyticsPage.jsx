import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTCooltip, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const { data: perf } = useQuery({
    queryKey: ['modelPerf'],
    queryFn: async () => (await api.get('/analytics/model-perf')).data
  });

  const { data: delays } = useQuery({
    queryKey: ['delayTrends'],
    queryFn: async () => (await api.get('/analytics/delays')).data
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics & ML Performance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Insights and model prediction metrics tracked via MLflow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 shadow-soft hover:-translate-y-1 transition-transform">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">XGBoost Delay Classifier Metrics (v1.0.0)</h2>
          {perf ? (
             <div className="space-y-4">
                {Object.entries(perf).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{key}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{(value * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-1.5">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${value * 100}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
          ) : (
            <div className="animate-pulse h-32 bg-gray-100 dark:bg-dark-700 rounded"></div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-soft hover:-translate-y-1 transition-transform">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Route Delay Rates</h2>
          {delays ? (
            <div className="space-y-3">
               {delays.map((d, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-100 dark:border-dark-700 pb-2">
                     <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{d.route}</span>
                     <span className="text-sm font-semibold text-red-500">{(d.delay_rate * 100).toFixed(1)}%</span>
                  </div>
               ))}
            </div>
          ) : (
             <div className="animate-pulse h-32 bg-gray-100 dark:bg-dark-700 rounded"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
