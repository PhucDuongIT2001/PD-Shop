import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const handleVNPayPayment = async () => {
    try {
      setPaying(true);
      const res = await api.post(`/payment/vnpay/create?orderId=${id}`);
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.success(res.data.message || 'Link thanh toán đã được gửi vào email của bạn!');
      }
    } catch (error) {
      console.error('Error generating payment url:', error);
      toast.error(error.response?.data?.message || 'Không thể khởi tạo thanh toán VNPay');
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order detail:', error);
        toast.error('Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNCONFIRMED': return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
      case 'SHIPPING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'FAILED': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy đơn hàng</h2>
        <Link to="/orders" className="text-primary hover:underline mt-4 inline-block">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="mb-6">
        <Link to="/orders" className="text-slate-500 hover:text-primary font-medium flex items-center gap-2 w-fit">
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Đơn hàng #{order.id}</h1>
            <p className="text-slate-500 font-medium mt-1">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Customer Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-primary"></i> Địa chỉ giao hàng
              </h3>
              <div className="space-y-2 text-sm font-medium text-slate-600">
                <p><span className="text-slate-400 w-24 inline-block">Họ tên:</span> {order.shippingName}</p>
                <p><span className="text-slate-400 w-24 inline-block">SĐT:</span> {order.shippingPhone}</p>
                <p className="leading-relaxed"><span className="text-slate-400 w-24 inline-block">Địa chỉ:</span> {order.shippingAddress}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-credit-card text-primary"></i> Thanh toán
              </h3>
              <div className="space-y-2 text-sm font-medium text-slate-600">
                <p><span className="text-slate-400 w-24 inline-block">Phương thức:</span> {order.paymentMethod}</p>
                <p><span className="text-slate-400 w-24 inline-block">Trạng thái:</span> 
                  <span className={order.paymentStatus === 'PAID' ? 'text-green-600 font-bold ml-1' : 'text-yellow-600 font-bold ml-1'}>
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </p>
                {order.paymentMethod === 'VNPAY' && order.paymentStatus !== 'PAID' && (
                  <button
                    onClick={handleVNPayPayment}
                    disabled={paying}
                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/10 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    {paying ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin mr-1"></i> Đang kết nối...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-credit-card mr-1"></i> Thanh toán ngay
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl text-slate-800 mb-4">Sản phẩm đã đặt</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-2xl items-center">
                  <img src={getProductImageUrl(item.productThumbnail)} alt={item.productName} className="w-20 h-20 object-cover rounded-xl bg-slate-50" />
                  <div className="flex-grow">
                    <Link to={`/product/${item.productId}`} className="font-bold text-slate-800 hover:text-primary transition-colors text-lg line-clamp-1">
                      {item.productName}
                    </Link>
                    <p className="text-slate-500 font-medium mt-1">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{item.price?.toLocaleString('vi-VN')}₫</p>
                    <p className="text-sm font-semibold text-primary mt-1">{(item.price * item.quantity)?.toLocaleString('vi-VN')}₫</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-slate-500">Tạm tính:</span>
                <span className="font-bold text-slate-800">{order.totalAmount?.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                <span className="font-medium text-slate-500">Phí vận chuyển:</span>
                <span className="font-bold text-slate-800">0₫</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-black text-slate-800">Tổng cộng:</span>
                <span className="font-black text-primary text-2xl">{order.totalAmount?.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
