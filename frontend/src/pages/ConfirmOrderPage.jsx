import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

const ConfirmOrderPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link xác nhận không hợp lệ hoặc bị thiếu.');
      return;
    }

    const confirmOrder = async () => {
      try {
        const response = await api.post(`/orders/confirm?token=${token}`);
        if (response.data.paymentUrl) {
          setPaymentUrl(response.data.paymentUrl);
          setStatus('redirecting');
          setMessage(`Đơn hàng #${response.data.id} đã được xác nhận thành công!`);
        } else {
          setStatus('success');
          setMessage(`Đơn hàng #${response.data.id} đã được xác nhận thành công!`);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Xác nhận đơn hàng thất bại. Link có thể đã hết hạn.');
      }
    };

    confirmOrder();
  }, [token]);

  useEffect(() => {
    if (status !== 'redirecting' || countdown <= 0 || !paymentUrl) return;
    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
      if (countdown === 1) {
        window.location.href = paymentUrl;
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [status, countdown, paymentUrl]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 text-center"
      >
        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
            <h2 className="text-2xl font-black text-slate-800 italic uppercase">Đang xác nhận...</h2>
            <p className="text-slate-500 mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase mb-2">Đã Xác Nhận!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            
            <a 
              href={paymentUrl}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black uppercase italic tracking-wider transition-all hover:shadow-lg hover:shadow-blue-600/20 active:scale-98 mb-4"
            >
              Thanh toán ngay qua VNPAY
            </a>

            <div className="flex flex-col items-center gap-2 my-2">
              <p className="text-[11px] font-bold text-slate-400">Hoặc quét mã QR dưới đây bằng điện thoại để thanh toán:</p>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(paymentUrl)}`} 
                  alt="VNPAY QR Code" 
                  className="w-[150px] h-[150px] object-contain rounded-lg"
                />
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-bold mt-2">
              Hệ thống sẽ tự động chuyển hướng sau <span className="font-extrabold text-blue-600">{countdown}s</span>...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase mb-2">Thành Công!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/orders')} className="w-full bg-slate-900 text-white hover:bg-slate-800">
              Quản lý đơn hàng
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 italic uppercase mb-2">Thất bại</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            <Button onClick={() => navigate('/')} className="w-full bg-blue-600 text-white hover:bg-blue-700">
              Về trang chủ
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ConfirmOrderPage;
