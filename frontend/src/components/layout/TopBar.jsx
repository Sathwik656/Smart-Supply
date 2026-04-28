import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAlertStore } from '../../store/alertStore';
import { Link } from 'react-router-dom';

const TopBar = () => {
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const unreadCount = useAlertStore(state => state.unreadCount);

  return (
    <header className="h-16 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-700 flex items-center justify-between px-6 z-20 sticky top-0 shadow-soft">
      <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400 transition-colors">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4">
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Link to="/alerts" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-800"></span>
          )}
        </Link>

        <div className="h-8 w-[1px] bg-gray-200 dark:bg-dark-700 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
            G
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Guest</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
