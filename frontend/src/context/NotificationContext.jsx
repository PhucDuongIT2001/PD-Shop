import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${pageNum}&size=10`);
      const list = res.data.content || [];
      
      if (append) {
        setNotifications(prev => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(n => n.id));
          const newFiltered = list.filter(n => !existingIds.has(n.id));
          return [...prev, ...newFiltered];
        });
      } else {
        setNotifications(list);
      }
      
      setHasMore(!res.data.last);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1, true);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đọc tất cả thông báo!');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const notif = notifications.find(n => n.id === id);
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Đã xóa thông báo!');
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Real-time EventSource connection
  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const sseUrl = `${window.location.protocol}//${window.location.host}/api/notifications/stream?token=${token}`;
    const sse = new EventSource(sseUrl);
    eventSourceRef.current = sse;

    sse.addEventListener('CONNECT', (e) => {
      console.log('SSE connection established:', e.data);
    });

    sse.addEventListener('NOTIFICATION', (e) => {
      try {
        const newNotif = JSON.parse(e.data);
        
        // Add to front of list
        setNotifications(prev => {
          // Avoid duplicates
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        
        // Increment unread
        setUnreadCount(prev => prev + 1);
        
        // Display toast alert
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-slate-800 uppercase italic tracking-tight">{newNotif.title}</span>
            <span className="text-xs text-slate-500 font-medium">{newNotif.message}</span>
          </div>
        ), {
          icon: '🔔',
          duration: 5000,
        });

      } catch (err) {
        console.error('Error parsing SSE notification payload:', err);
      }
    });

    sse.onerror = (err) => {
      console.warn('SSE connection encountered error, reconnecting...', err);
      sse.close();
      
      // Auto-reconnect in 5 seconds
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        if (user) connectSSE();
      }, 5000);
    };
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications(1, false);
      connectSSE();
    } else {
      // Clean up on logout
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      hasMore,
      fetchNotifications,
      fetchUnreadCount,
      loadMore,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
