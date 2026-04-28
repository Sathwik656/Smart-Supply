import { Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, AlertTriangle, BarChart2, Truck, Settings } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const sidebarOpen = useUIStore(state => state.sidebarOpen);
  const location = useLocation();
  const { isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/shipments', label: 'Shipments', icon: <Package size={20} /> },
    { to: '/alerts', label: 'Alerts', icon: <AlertTriangle size={20} /> },
    { to: '/vehicles', label: 'Fleet', icon: <Truck size={20} /> },
    { to: '/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
    isAdmin ? { to: '/settings', label: 'Settings', icon: <Settings size={20} /> } : null,
  ].filter(Boolean);

  return (
    <aside className={`bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-dark-700">
        {sidebarOpen ? (
          <span className="text-lg font-bold text-brand-600 dark:text-brand-500">SmartLogis</span>
        ) : (
          <span className="text-xl font-bold text-brand-600 dark:text-brand-500">SL</span>
        )}
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
        {links.map(link => {
          const isActive = location.pathname.startsWith(link.to);
          return (
            <Link 
              key={link.to} 
              to={link.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-r-lg transition-all duration-200 border-l-4 ${
                isActive 
                  ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-sm dark:bg-brand-900/30 dark:border-brand-400 dark:text-brand-400' 
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-dark-700/50 dark:hover:text-gray-200'
              }`}
            >
              {link.icon}
              {sidebarOpen && <span className="font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
