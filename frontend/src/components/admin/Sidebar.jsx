import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Package, ListTree, Users, 
  Star, Ticket, Boxes, BarChart3, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: ShoppingBag, label: 'Đơn hàng', path: '/admin/orders' },
  { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
  { icon: ListTree, label: 'Danh mục', path: '/admin/categories' },
  { icon: Boxes, label: 'Thương hiệu', path: '/admin/brands' },
  { icon: Users, label: 'Khách hàng', path: '/admin/customers' },
  { icon: Star, label: 'Đánh giá', path: '/admin/reviews' },
  { icon: Ticket, label: 'Mã giảm giá', path: '/admin/coupons' },
  { icon: BarChart3, label: 'Doanh thu', path: '/admin/revenue' },
  { icon: DollarSign, label: 'Thanh toán', path: '/admin/transactions' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={`fixed left-0 top-0 h-full bg-slate-900 text-slate-400 transition-all duration-300 z-50 flex flex-col border-r border-slate-800 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800 h-20">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">PD</div>
            <span className="text-white font-black uppercase italic tracking-tighter text-xl">Admin</span>
          </div>
        )}
        {isCollapsed && <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black mx-auto">PD</div>}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors hidden lg:flex"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`} />
              {!isCollapsed && <span className="font-bold text-sm uppercase italic tracking-tighter">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Menu */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          to="/admin/settings"
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all group text-slate-400"
        >
          <Settings className="w-5 h-5 shrink-0 group-hover:text-blue-400" />
          {!isCollapsed && <span className="font-bold text-sm uppercase italic tracking-tighter">Cài đặt</span>}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group text-slate-400"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-500" />
          {!isCollapsed && <span className="font-bold text-sm uppercase italic tracking-tighter">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
