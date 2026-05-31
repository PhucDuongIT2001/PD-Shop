import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

export const useWebSocket = (topic, onMessageReceived) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Lấy host của backend, mặc định chạy localhost:8080 ở môi trường phát triển
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const host = isLocalhost ? 'localhost:8080' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/websocket`;

    const stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        console.log('Successfully connected to STOMP WebSocket server at:', wsUrl);
        
        stompClient.subscribe(topic, (message) => {
          if (message.body) {
            try {
              const parsedData = JSON.parse(message.body);
              onMessageReceived(parsedData);
            } catch (e) {
              onMessageReceived(message.body);
            }
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('Disconnected from STOMP WebSocket server');
      },
      onStompError: (frame) => {
        console.error('STOMP Broker reported error:', frame.headers['message']);
        console.error('Details:', frame.body);
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log('Cleaned up WebSocket connection');
      }
    };
  }, [topic, onMessageReceived]);

  return { connected };
};
