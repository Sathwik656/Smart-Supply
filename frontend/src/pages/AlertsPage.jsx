import AlertPanel from '../components/dashboard/AlertPanel';

const AlertsPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-8">Alerts Management</h1>
      <AlertPanel />
    </div>
  );
};

export default AlertsPage;
