import KPICards from '../components/dashboard/KPICards';
import LiveMap from '../components/dashboard/LiveMap';
import AlertPanel from '../components/dashboard/AlertPanel';
import ShipmentDrawer from '../components/dashboard/ShipmentDrawer';
import { useWebSocket } from '../hooks/useWebSocket';

const DashboardPage = () => {
  // Initialize websocket connection for live dashboard
  useWebSocket();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Fleet Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time supply chain monitoring & optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </span>
          <span className="text-sm font-medium text-brand-600 dark:text-brand-500">Live Sync</span>
        </div>
      </div>

      <KPICards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMap />
        </div>
        <div className="lg:col-span-1">
          <AlertPanel />
        </div>
      </div>

      <ShipmentDrawer />
    </div>
  );
};

export default DashboardPage;
