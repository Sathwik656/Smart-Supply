import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertStore } from '../store/alertStore';
import { getSocketBaseUrl } from '../services/api';

export const useWebSocket = () => {
  const socketRef = useRef(null);
  const queryClient = useQueryClient();
  const incrementUnread = useAlertStore(state => state.incrementUnread);

  useEffect(() => {
    const URL = getSocketBaseUrl();
    
    socketRef.current = io(URL, {
      path: '/ws/socket.io',
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });

    socketRef.current.on('connect', () => {
      console.log('WS connected');
      socketRef.current.emit('subscribe:shipments', {});
      socketRef.current.emit('subscribe:alerts', {});
    });

    socketRef.current.on('shipment:updated', (data) => {
      // Invalidate specific shipment query to refetch latest
      queryClient.invalidateQueries(['shipment', data.shipment_id]);
      // Also invalidate the list to update map and table
      queryClient.invalidateQueries(['shipments']);
    });

    socketRef.current.on('alert:new', (data) => {
      queryClient.invalidateQueries(['alerts']);
      incrementUnread();
    });

    socketRef.current.on('alert:resolved', (data) => {
      queryClient.invalidateQueries(['alerts']);
    });

    socketRef.current.on('kpi:updated', (data) => {
      queryClient.setQueryData(['analytics_summary'], data);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [queryClient, incrementUnread]);
};
