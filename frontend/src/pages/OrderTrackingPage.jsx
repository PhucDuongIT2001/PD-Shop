import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';

const OrderTrackingPage = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) {
      toast.error('Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/orders/track?id=${orderId}&phone=${phone}`);
      setOrder(response.data);
      toast.success('Tra cứu thành công!');
    } catch (error) {
      console.error('Error tracking order:', error);
      setOrder(null);
      if (error.response && error.response.status === 404) {
        toast.error('Không tìm thấy đơn hàng hoặc số điện thoại không khớp!');
      } else {
        toast.error('Có lỗi xảy ra khi tra cứu đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNCONFIRMED': return 'bg-orange-100 text-orange-850';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
      case 'SHIPPING': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'UNCONFIRMED': return 'Chờ xác nhận Email';
      case 'PENDING': return 'Chờ xử lý';
      case 'PROCESSING': return 'Đang chuẩn bị';
      case 'SHIPPED':
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao thành công';
      case 'CANCELLED': return 'Đã huỷ';
      case 'PAID': return 'Đã thanh toán';
      case 'FAILED': return 'Thanh toán thất bại';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN') + ' ' + new Date(dateString).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen mt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tra Cứu Đơn Hàng</h1>
        <p className="text-gray-600">Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8"
      >
        <form onSubmit={handleTrackOrder} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn hàng</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Ví dụ: 123"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại đặt hàng</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Nhập số điện thoại..."
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Tra cứu ngay'
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {searched && !loading && !order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 text-red-600 p-6 rounded-xl text-center shadow-sm"
        >
          Không tìm thấy đơn hàng nào khớp với thông tin bạn cung cấp. Vui lòng kiểm tra lại!
        </motion.div>
      )}

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="border-b border-gray-100 p-6 md:p-8 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Mã đơn hàng: <span className="font-mono text-gray-900 font-medium">#{order.id}</span></p>
              <p className="text-sm text-gray-500">Ngày đặt: <span className="text-gray-900">{formatDate(order.orderDate)}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Thông tin nhận hàng</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-900">Người nhận:</span> {order.shippingName}</p>
                  <p><span className="font-medium text-gray-900">Điện thoại:</span> {order.shippingPhone}</p>
                  <p><span className="font-medium text-gray-900">Địa chỉ:</span> {order.shippingAddress}</p>
                  {order.note && <p><span className="font-medium text-gray-900">Ghi chú:</span> {order.note}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Sản phẩm đã đặt</h3>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.productThumbnail ? (
                        <img src={getProductImageUrl(item.productThumbnail)} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-sm text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-gray-500 line-through mt-1">Tổng: {formatCurrency(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
