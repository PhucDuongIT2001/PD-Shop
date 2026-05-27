import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang chuẩn bị';
      case 'SHIPPED': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao';
      case 'CANCELLED': return 'Đã huỷ';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-black mb-8 text-slate-800">Đơn Hàng Của Tôi</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
          <i className="fa-solid fa-box-open text-6xl text-slate-300 mb-4"></i>
          <p className="text-slate-500 mb-6 text-lg font-medium">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="btn-primary inline-block">Tiếp Tục Mua Sắm</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-100">
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Mã đơn hàng</p>
                  <p className="text-lg font-bold text-slate-800">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Ngày đặt</p>
                  <p className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Tổng tiền</p>
                  <p className="font-bold text-primary">{order.totalAmount?.toLocaleString('vi-VN')}₫</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div>
                  <Link to={`/orders/${order.id}`} className="text-primary font-bold hover:underline">
                    Xem chi tiết <i className="fa-solid fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 flex items-center gap-3 bg-slate-50 p-2 rounded-xl pr-4 border border-slate-100">
                      <img src={item.productThumbnail} alt={item.productName} className="w-12 h-12 object-cover rounded-lg" />
                      <div>
                        <p className="font-semibold text-sm text-slate-800 line-clamp-1 max-w-[150px]">{item.productName}</p>
                        <p className="text-xs text-slate-500 font-medium">SL: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
