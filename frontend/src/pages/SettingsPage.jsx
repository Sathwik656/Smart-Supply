import { useMockSettings, useUpdateMockSettings } from '../hooks/useMockData';
import { Settings, Bell, Truck, AlertTriangle, Thermometer, Gauge, MapPin, Mail, Smartphone, Globe, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
        <Icon size={20} className="text-brand-600 dark:text-brand-400" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange, label }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
    <div 
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-gray-300 dark:bg-dark-600'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  </label>
);

const Input = ({ value, onChange, type = 'text', placeholder, suffix }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
    />
    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{suffix}</span>}
  </div>
);

const SettingsPage = () => {
  const { data: settings, isLoading, refetch } = useMockSettings();
  const updateSettings = useUpdateMockSettings();
  const [activeTab, setActiveTab] = useState('thresholds');
  const [localSettings, setLocalSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  // Initialize local settings when data loads
  if (settings && !localSettings) {
    setLocalSettings(JSON.parse(JSON.stringify(settings)));
  }

  const handleSave = async () => {
    await updateSettings.mutateAsync(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (category, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: typeof value === 'object' && value !== null 
          ? { ...prev[category][key], ...value }
          : value
      }
    }));
  };

  if (isLoading || !localSettings) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-dark-700 rounded"></div>
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 dark:bg-dark-700 rounded-xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-dark-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'thresholds', label: 'Alert Thresholds', icon: AlertTriangle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure alerts, notifications, and system preferences</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            <RefreshCw size={16} /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-brand-500 text-white hover:bg-brand-600'
            } disabled:opacity-50`}
          >
            <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-dark-700 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert Thresholds Tab */}
      {activeTab === 'thresholds' && (
        <div className="space-y-6">
          <SectionCard 
            icon={Thermometer} 
            title="Temperature Alerts" 
            description="Configure cold chain temperature monitoring"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.alert_thresholds.temperature.enabled}
                onChange={(v) => updateSetting('alert_thresholds', 'temperature', { enabled: v })}
                label="Enable temperature monitoring"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Temperature (°C)</label>
                  <Input 
                    value={localSettings.alert_thresholds.temperature.max_temp_celsius}
                    onChange={(v) => updateSetting('alert_thresholds', 'temperature', { max_temp_celsius: Number(v) })}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Critical Temperature (°C)</label>
                  <Input 
                    value={localSettings.alert_thresholds.temperature.critical_temp_celsius}
                    onChange={(v) => updateSetting('alert_thresholds', 'temperature', { critical_temp_celsius: Number(v) })}
                    type="number"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            icon={Gauge} 
            title="Speed Alerts" 
            description="Configure vehicle speed monitoring"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.alert_thresholds.speed.enabled}
                onChange={(v) => updateSetting('alert_thresholds', 'speed', { enabled: v })}
                label="Enable speed monitoring"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Speed (km/h)</label>
                  <Input 
                    value={localSettings.alert_thresholds.speed.max_speed_kmh}
                    onChange={(v) => updateSetting('alert_thresholds', 'speed', { max_speed_kmh: Number(v) })}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Critical Speed (km/h)</label>
                  <Input 
                    value={localSettings.alert_thresholds.speed.critical_speed_kmh}
                    onChange={(v) => updateSetting('alert_thresholds', 'speed', { critical_speed_kmh: Number(v) })}
                    type="number"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            icon={AlertTriangle} 
            title="Delay Risk Alerts" 
            description="Configure shipment delay prediction thresholds"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.alert_thresholds.delay_risk.enabled}
                onChange={(v) => updateSetting('alert_thresholds', 'delay_risk', { enabled: v })}
                label="Enable delay risk alerts"
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">High Severity</label>
                  <Input 
                    value={localSettings.alert_thresholds.delay_risk.high_severity_threshold}
                    onChange={(v) => updateSetting('alert_thresholds', 'delay_risk', { high_severity_threshold: Number(v) })}
                    type="number"
                    suffix="%"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Medium Severity</label>
                  <Input 
                    value={localSettings.alert_thresholds.delay_risk.medium_severity_threshold}
                    onChange={(v) => updateSetting('alert_thresholds', 'delay_risk', { medium_severity_threshold: Number(v) })}
                    type="number"
                    suffix="%"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Low Severity</label>
                  <Input 
                    value={localSettings.alert_thresholds.delay_risk.low_severity_threshold}
                    onChange={(v) => updateSetting('alert_thresholds', 'delay_risk', { low_severity_threshold: Number(v) })}
                    type="number"
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            icon={MapPin} 
            title="Geofence Alerts" 
            description="Configure location-based alerts"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.alert_thresholds.geofence.enabled}
                onChange={(v) => updateSetting('alert_thresholds', 'geofence', { enabled: v })}
                label="Enable geofence monitoring"
              />
              <Toggle 
                enabled={localSettings.alert_thresholds.geofence.alert_on_boundary_cross}
                onChange={(v) => updateSetting('alert_thresholds', 'geofence', { alert_on_boundary_cross: v })}
                label="Alert on boundary crossing"
              />
              <Toggle 
                enabled={localSettings.alert_thresholds.geofence.alert_on_unauthorized_zone}
                onChange={(v) => updateSetting('alert_thresholds', 'geofence', { alert_on_unauthorized_zone: v })}
                label="Alert on unauthorized zone entry"
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <SectionCard 
            icon={Mail} 
            title="Email Notifications" 
            description="Configure email alert delivery"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.notifications.email.enabled}
                onChange={(v) => updateSetting('notifications', 'email', { enabled: v })}
                label="Enable email notifications"
              />
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Recipients (comma-separated)</label>
                <Input 
                  value={localSettings.notifications.email.recipients.join(', ')}
                  onChange={(v) => updateSetting('notifications', 'email', { recipients: v.split(',').map(e => e.trim()) })}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            icon={Smartphone} 
            title="SMS Notifications" 
            description="Configure SMS alert delivery"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.notifications.sms.enabled}
                onChange={(v) => updateSetting('notifications', 'sms', { enabled: v })}
                label="Enable SMS notifications"
              />
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone Numbers (comma-separated)</label>
                <Input 
                  value={localSettings.notifications.sms.recipients.join(', ')}
                  onChange={(v) => updateSetting('notifications', 'sms', { recipients: v.split(',').map(e => e.trim()) })}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard 
            icon={Bell} 
            title="Push Notifications" 
            description="Configure in-app push notifications"
          >
            <div className="space-y-4">
              <Toggle 
                enabled={localSettings.notifications.push.enabled}
                onChange={(v) => updateSetting('notifications', 'push', { enabled: v })}
                label="Enable push notifications"
              />
              <Toggle 
                enabled={localSettings.notifications.push.all_alerts}
                onChange={(v) => updateSetting('notifications', 'push', { all_alerts: v })}
                label="Receive all alerts"
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <SectionCard 
            icon={Settings} 
            title="System Configuration" 
            description="General system settings"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Data Retention (days)</label>
                  <Input 
                    value={localSettings.system.data_retention_days}
                    onChange={(v) => updateSetting('system', 'data_retention_days', Number(v))}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Auto-resolve Alerts (hours)</label>
                  <Input 
                    value={localSettings.system.auto_resolve_hours}
                    onChange={(v) => updateSetting('system', 'auto_resolve_hours', Number(v))}
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Prediction Refresh (minutes)</label>
                  <Input 
                    value={localSettings.system.prediction_refresh_minutes}
                    onChange={(v) => updateSetting('system', 'prediction_refresh_minutes', Number(v))}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Timezone</label>
                  <Input 
                    value={localSettings.system.timezone}
                    onChange={(v) => updateSetting('system', 'timezone', v)}
                  />
                </div>
              </div>
              <Toggle 
                enabled={localSettings.system.enable_ml_predictions}
                onChange={(v) => updateSetting('system', 'enable_ml_predictions', v)}
                label="Enable ML predictions"
              />
            </div>
          </SectionCard>

          <SectionCard 
            icon={Globe} 
            title="API & Performance" 
            description="API and caching configuration"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Rate Limit (per minute)</label>
                  <Input 
                    value={localSettings.api.rate_limit_per_minute}
                    onChange={(v) => updateSetting('api', 'rate_limit_per_minute', Number(v))}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cache TTL (seconds)</label>
                  <Input 
                    value={localSettings.api.cache_ttl_seconds}
                    onChange={(v) => updateSetting('api', 'cache_ttl_seconds', Number(v))}
                    type="number"
                  />
                </div>
              </div>
              <Toggle 
                enabled={localSettings.api.enable_caching}
                onChange={(v) => updateSetting('api', 'enable_caching', v)}
                label="Enable caching"
              />
              <Toggle 
                enabled={localSettings.api.enable_metrics}
                onChange={(v) => updateSetting('api', 'enable_metrics', v)}
                label="Enable metrics collection"
              />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
