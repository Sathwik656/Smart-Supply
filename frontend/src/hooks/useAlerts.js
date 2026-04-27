import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useAlerts = (filters = {}) => {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/alerts/?${params}`);
      return res.data;
    },
  });
};

export const useApproveAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId) => {
      const res = await api.patch(`/alerts/${alertId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useDismissAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId) => {
      const res = await api.patch(`/alerts/${alertId}/dismiss`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};
