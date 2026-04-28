import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ==================== Mock Alerts Hooks ====================

export const useMockAlerts = (filters = {}) => {
  return useQuery({
    queryKey: ['mock-alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/mock/alerts?${params}`);
      return res.data;
    },
  });
};

export const useMockAlertDetail = (alertId) => {
  return useQuery({
    queryKey: ['mock-alert', alertId],
    queryFn: async () => {
      const res = await api.get(`/mock/alerts/${alertId}`);
      return res.data;
    },
    enabled: !!alertId,
  });
};

export const useApproveMockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId) => {
      const res = await api.patch(`/mock/alerts/${alertId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-alerts'] });
    },
  });
};

export const useDismissMockAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId) => {
      const res = await api.patch(`/mock/alerts/${alertId}/dismiss`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-alerts'] });
    },
  });
};

// ==================== Mock Vehicles Hooks ====================

export const useMockVehicles = (filters = {}) => {
  return useQuery({
    queryKey: ['mock-vehicles', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/mock/vehicles?${params}`);
      return res.data;
    },
  });
};

export const useMockVehicleDetail = (vehicleId) => {
  return useQuery({
    queryKey: ['mock-vehicle', vehicleId],
    queryFn: async () => {
      const res = await api.get(`/mock/vehicles/${vehicleId}`);
      return res.data;
    },
    enabled: !!vehicleId,
  });
};

export const useMockVehicleLocation = (vehicleId) => {
  return useQuery({
    queryKey: ['mock-vehicle-location', vehicleId],
    queryFn: async () => {
      const res = await api.get(`/mock/vehicles/${vehicleId}/location`);
      return res.data;
    },
    enabled: !!vehicleId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// ==================== Mock Settings Hooks ====================

export const useMockSettings = () => {
  return useQuery({
    queryKey: ['mock-settings'],
    queryFn: async () => {
      const res = await api.get('/mock/settings');
      return res.data;
    },
  });
};

export const useMockSettingsCategory = (category) => {
  return useQuery({
    queryKey: ['mock-settings', category],
    queryFn: async () => {
      const res = await api.get(`/mock/settings/${category}`);
      return res.data;
    },
    enabled: !!category,
  });
};

export const useUpdateMockSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings) => {
      const res = await api.patch('/mock/settings', settings);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mock-settings'] });
    },
  });
};

// ==================== Mock Dashboard Hooks ====================

export const useMockDashboardStats = () => {
  return useQuery({
    queryKey: ['mock-dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/mock/dashboard/stats');
      return res.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useMockKPIs = () => {
  return useQuery({
    queryKey: ['mock-kpis'],
    queryFn: async () => {
      const res = await api.get('/mock/dashboard/kpis');
      return res.data;
    },
    refetchInterval: 60000,
  });
};