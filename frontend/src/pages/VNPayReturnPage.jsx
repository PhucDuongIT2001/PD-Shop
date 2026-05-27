import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const VNPayReturnPage = () => {
  const location = useLocation();
  const { fetchCart } = useCart();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // location.search contains the query params returned from VNPAY
        const response = await api.get(`/payment/vnpay/return${location.search}`);
        setResult(response.data);
        if (response.data.success) {
          await fetchCart(); // Clear cart on success
        }
      } catch (error) {
        console.error("Lỗi xác minh VNPAY:", error);
        setResult({ success: false, message: 'Có lỗi xảy ra khi xác thực thanh toán.' });
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setResult({ success: false, message: 'Dữ liệu không hợp lệ.' });
      setLoading(false);
    }
  }, [location.search, fetchCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Đang xác thực thanh toán...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex flex-col items-center pt-24">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-md w-full text-center">
        {result?.success ? (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Thanh toán thành công!</h1>
            <p className="text-slate-500 mb-6 font-medium">Cảm ơn bạn đã mua sắm tại hệ thống của chúng tôi.</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Mã đơn hàng:</span>
                <span className="font-black text-slate-800">#{result.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Số tiền:</span>
                <span className="font-black text-blue-600">{Number(result.amount || 0)?.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-bold">Mã giao dịch:</span>
                <span className="font-black text-slate-800">{result.transactionNo}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Thanh toán thất bại</h1>
            <p className="text-slate-500 mb-8 font-medium">{result?.message || 'Giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra.'}</p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link to="/orders" className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full inline-block">
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-slate-200 transition-all w-full inline-block">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturnPage;
