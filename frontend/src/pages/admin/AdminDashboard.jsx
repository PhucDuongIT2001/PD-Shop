import React, { useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingCart, Users, Package, 
  ArrowUpRight, ArrowDownRight, TrendingUp, Clock, UserPlus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import api from '../../api/axios';

const data = [
  { name: 'Jan', revenue: 45000, orders: 120 },
  { name: 'Feb', revenue: 52000, orders: 145 },
  { name: 'Mar', revenue: 48000, orders: 130 },
  { name: 'Apr', revenue: 61000, orders: 170 },
  { name: 'May', revenue: 55000, orders: 155 },
  { name: 'Jun', revenue: 67000, orders: 190 },
  { name: 'Jul', revenue: 75000, orders: 210 },
];

const categoryData = [
  { name: 'Smartphone', value: 400, color: '#2563eb' },
  { name: 'Laptop', value: 300, color: '#8b5cf6' },
  { name: 'Accessories', value: 300, color: '#f59e0b' },
  { name: 'Watch', value: 200, color: '#10b981' },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500/10 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-opacity-100 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-black italic px-2 py-1 rounded-lg ${
        trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
      }`}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trendValue}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-black uppercase tracking-wider mb-1 italic">{title}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{value}</h3>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    newOrders: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const response = await api.get('/admin/analytics/overview');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching overview stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Tổng Quan Hệ Thống</h2>
          <p className="text-slate-500 font-medium">Chào ngày mới! Đây là tình hình kinh doanh hôm nay.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm border border-slate-200">Xuất báo cáo</button>
          <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/20">Tạo đơn hàng</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={loading ? "..." : formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+12.5%" 
          color="text-blue-600 bg-blue-600"
        />
        <StatCard 
          title="Đơn hàng mới" 
          value={loading ? "..." : stats.newOrders.toLocaleString()} 
          icon={ShoppingCart} 
          trend="up" 
          trendValue="+8.2%" 
          color="text-purple-600 bg-purple-600"
        />
        <StatCard 
          title="Khách hàng" 
          value={loading ? "..." : stats.totalCustomers.toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="+5.4%" 
          color="text-amber-600 bg-amber-600"
        />
        <StatCard 
          title="Sản phẩm" 
          value={loading ? "..." : stats.totalProducts.toLocaleString()} 
          icon={Package} 
          trend="down" 
          trendValue="-2.1%" 
          color="text-emerald-600 bg-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Biểu Đồ Doanh Thu</h3>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/10">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>1 năm qua</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8">Phân Loại SP</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-4">
              <span className="text-2xl font-black text-slate-900 italic tracking-tighter">1,200</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Bán ra</span>
            </div>
          </div>
          <div className="mt-auto space-y-4">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                  <span className="text-sm font-bold text-slate-600 italic tracking-tight">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 italic tracking-tighter">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Đơn Hàng Gần Đây</h3>
          <button className="text-blue-600 font-bold text-sm hover:underline italic tracking-tight uppercase">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50 italic">
                <th className="pb-4">Đơn hàng</th>
                <th className="pb-4">Khách hàng</th>
                <th className="pb-4">Ngày tạo</th>
                <th className="pb-4">Tổng tiền</th>
                <th className="pb-4">Trạng thái</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { id: '#ORD-8924', customer: 'Hoàng Anh', date: '12/05/2024', total: '24.990.000đ', status: 'Hoàn thành', color: 'bg-green-100 text-green-600' },
                { id: '#ORD-8925', customer: 'Minh Quân', date: '12/05/2024', total: '8.490.000đ', status: 'Đang giao', color: 'bg-blue-100 text-blue-600' },
                { id: '#ORD-8926', customer: 'Thu Hà', date: '11/05/2024', total: '1.200.000đ', status: 'Chờ xử lý', color: 'bg-amber-100 text-amber-600' },
                { id: '#ORD-8927', customer: 'Văn Cường', date: '11/05/2024', total: '34.500.000đ', status: 'Đã hủy', color: 'bg-red-100 text-red-600' },
              ].map((order, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-black text-slate-900 text-sm italic tracking-tight">{order.id}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {order.customer[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-500 font-medium">{order.date}</td>
                  <td className="py-4 text-sm font-black text-slate-900 italic tracking-tighter">{order.total}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic ${order.color}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Clock className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
