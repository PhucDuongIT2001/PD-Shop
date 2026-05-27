import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
