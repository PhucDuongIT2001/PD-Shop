import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Trash2, X, AlertCircle, ShoppingBag, 
  Users, CheckCircle2, Info, ChevronRight, MessageSquare 
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    hasMore, 
    loadMore, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-50 text-red-600 border-red-100';
      case 'HIGH': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'MEDIUM': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_CREATED': return ShoppingBag;
      case 'NEW_USER_REGISTERED': return Users;
      case 'LOW_STOCK': return AlertCircle;
      case 'ORDER_DELIVERED': return CheckCircle2;
      default: return Info;
    }
  };

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.redirectUrl) {
      navigate(notif.redirectUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white px-0.5 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-[100] flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h4 className="font-black text-slate-800 uppercase italic tracking-tight">Thông Báo</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Bạn có {unreadCount} tin nhắn mới</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-wider italic flex items-center gap-1 transition-colors"
                >
                  Đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
              {notifications.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <h5 className="font-bold text-slate-700 text-sm">Hộp thư trống</h5>
                  <p className="text-slate-400 text-xs mt-1">Không có thông báo mới nào dành cho bạn.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notif) => {
                    const IconComp = getNotificationIcon(notif.type);
                    return (
                      <div 
                        key={notif.id}
                        className={`p-4 flex gap-4 transition-all relative group cursor-pointer hover:bg-slate-50/50 ${
                          !notif.isRead ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        {/* Priority indicator dot */}
                        {!notif.isRead && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}

                        {/* Icon Block */}
                        <div 
                          onClick={() => handleItemClick(notif)}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getPriorityColor(notif.priority)}`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>

                        {/* Content Block */}
                        <div 
                          onClick={() => handleItemClick(notif)}
                          className="flex-1 min-w-0"
                        >
                          <h6 className={`text-xs font-black text-slate-800 uppercase italic tracking-tight truncate ${
                            !notif.isRead ? 'text-slate-900 font-extrabold' : 'text-slate-600'
                          }`}>
                            {notif.title}
                          </h6>
                          <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 block">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>

                        {/* Actions Block */}
                        <div className="flex flex-col items-center justify-center shrink-0 self-center">
                          <button 
                            onClick={() => deleteNotification(notif.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {hasMore && (
              <button 
                onClick={loadMore}
                disabled={loading}
                className="w-full py-4 border-t border-slate-100 text-center text-xs font-black text-slate-500 hover:text-blue-600 bg-white transition-colors shrink-0 uppercase tracking-widest italic"
              >
                {loading ? 'Đang tải...' : 'Xem thêm thông báo'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
