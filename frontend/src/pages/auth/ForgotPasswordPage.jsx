import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ Email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Yêu cầu khôi phục mật khẩu đã được gửi!');
      setIsSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white font-black text-xl mb-6 shadow-md hover:bg-blue-700 transition-colors">
            PD
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu</h2>
          <p className="text-gray-500 text-sm">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu mới
          </p>
        </div>

        {!isSent ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm transition-colors shadow-md gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Gửi yêu cầu khôi phục
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-blue-900 text-base">Kiểm tra hộp thư của bạn</h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến email <strong>{email}</strong>. Vui lòng bấm vào liên kết đó để thiết lập mật khẩu mới (hiệu lực trong 15 phút).
            </p>
          </div>
        )}

        {/* Back to Login */}
        <div className="text-center pt-4 border-t border-gray-100">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Đăng nhập
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
