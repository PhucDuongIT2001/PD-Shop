import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Xử lý khi nhận được thông báo đẩy thời gian thực từ WebSocket
  const handleRealtimeNotification = useCallback((notification) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-fade-in' : 'animate-fade-out'
        } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-100 p-4`}
      >
        <div className="flex-1 w-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 text-2xl">
              🔔
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {notification.title || 'Thông báo hệ thống'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-slate-100 pl-3 ml-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Đóng
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  }, []);

  // Đăng ký lắng nghe kênh WebSocket /topic/notifications
  useWebSocket('/topic/notifications', handleRealtimeNotification);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {/* Header */}
        <AdminHeader />

        {/* Content */}
        <main className="p-8 flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest border-t border-slate-100 italic">
          © 2024 PD-SHOP ADMIN SYSTEM. ALL RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
