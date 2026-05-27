import React, { useState } from 'react';
import { 
  Search, Filter, MoreVertical, 
  Eye, Download, CheckCircle2, Truck, Package, XCircle 
} from 'lucide-react';
import { mockOrders } from '../../data/mockData';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orderList, setOrderList] = useState(mockOrders);

  const filteredOrders = orderList.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase italic tracking-widest"><CheckCircle2 className="w-3 h-3" /> Hoàn thành</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase italic tracking-widest"><Package className="w-3 h-3" /> Đang xử lý</span>;
      case 'SHIPPING':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase italic tracking-widest"><Truck className="w-3 h-3" /> Đang giao</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase italic tracking-widest"><XCircle className="w-3 h-3" /> Đã hủy</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrderList(orderList.map(o => o.id === id ? { ...o, status: newStatus } : o));
    toast.success('Cập nhật trạng thái đơn hàng thành công!');
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Quản Lý Đơn Hàng</h2>
          <p className="text-slate-500 font-medium">Theo dõi và xử lý đơn hàng của khách hàng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 font-bold rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Chờ xử lý', count: orderList.filter(o => o.status === 'PROCESSING').length, icon: Package, color: 'text-blue-600 bg-blue-100' },
          { label: 'Đang giao', count: orderList.filter(o => o.status === 'SHIPPING').length, icon: Truck, color: 'text-amber-600 bg-amber-100' },
          { label: 'Hoàn thành', count: orderList.filter(o => o.status === 'DELIVERED').length, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
          { label: 'Đã hủy', count: orderList.filter(o => o.status === 'CANCELLED').length, icon: XCircle, color: 'text-red-600 bg-red-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-900 italic tracking-tighter">{stat.count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm theo Mã đơn hoặc Tên khách..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="p-3 bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl transition-all border border-slate-100">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 italic">
                <th className="px-8 py-5">Mã đơn hàng</th>
                <th className="px-8 py-5">Khách hàng</th>
                <th className="px-8 py-5">Ngày đặt</th>
                <th className="px-8 py-5">Tổng tiền</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order, i) => (
                <tr key={order.id} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-slate-900 italic tracking-tighter uppercase">{order.id}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-slate-600">
                      {new Date(order.date).toLocaleDateString('vi-VN')} {new Date(order.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-blue-600 italic tracking-tighter">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1">
                      {order.items} sản phẩm • {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg px-2 py-1 outline-none mr-2 uppercase tracking-widest"
                      >
                        <option value="PROCESSING">Chờ xử lý</option>
                        <option value="SHIPPING">Đang giao</option>
                        <option value="DELIVERED">Hoàn thành</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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

export default AdminOrders;
