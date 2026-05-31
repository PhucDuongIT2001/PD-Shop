import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, ChevronDown, Home, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  return (
    <header className="bg-white border-b border-slate-100 h-20 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative group hidden sm:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh..." 
          className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-6 ml-auto">
        {/* Theme Toggle */}
        <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <Sun className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-6 border-l border-slate-100 group cursor-pointer select-none"
          >
            <div className="flex flex-col items-end hidden md:flex">
              <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">
                {user?.username || 'Admin'}
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'SUPER ADMIN'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:border-blue-500 transition-all">
              <img src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=2563eb&color=fff`} alt="avatar" />
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-all ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">{user?.username || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 font-bold">{user?.email || 'admin@pdshop.com'}</p>
              </div>

              {/* Go to homepage */}
              <Link
                to="/"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all group"
              >
                <Home className="w-4 h-4 group-hover:text-blue-600" />
                <span>Về trang chủ</span>
              </Link>

              {/* Profile */}
              <Link
                to="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group"
              >
                <User className="w-4 h-4" />
                <span>Cài đặt tài khoản</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
