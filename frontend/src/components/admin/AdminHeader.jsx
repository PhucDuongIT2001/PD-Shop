import React from 'react';
import { Search, Moon, Sun, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const AdminHeader = () => {
  const { user } = useAuth();

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

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-100 group cursor-pointer">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">
              {user?.username || 'Admin'}
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.roles?.[0]?.replace('ROLE_', '') || 'SUPER ADMIN'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm group-hover:border-blue-500 transition-all">
            <img src={`https://ui-avatars.com/api/?name=${user?.username || 'Admin'}&background=2563eb&color=fff`} alt="avatar" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
