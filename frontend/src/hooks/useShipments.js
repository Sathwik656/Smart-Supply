import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useShipments = (filters = {}) => {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/shipments/?${params}`);
      return res.data;
    },
  });
};

export const useShipmentDetail = (id) => {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const res = await api.get(`/shipments/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAlternateRoutes = (id) => {
  return useQuery({
    queryKey: ['routes', id],
    queryFn: async () => {
      const res = await api.get(`/routes/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};
