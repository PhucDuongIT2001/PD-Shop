import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Check, X, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [isValidating, setIsValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password validation criteria
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':",./<>?~`|]/.test(password);
  const passwordsMatch = password && password === confirmPassword;
  
  const isFormValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Mã xác thực không tìm thấy. Vui lòng kiểm tra lại liên kết khôi phục.');
        setIsValidating(false);
        return;
      }

      try {
        await api.get(`/auth/validate-reset-token?token=${token}`);
        setIsValidating(false);
      } catch (error) {
        setTokenError(error.response?.data?.message || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Vui lòng đáp ứng đầy đủ yêu cầu bảo mật của mật khẩu');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success(res.data.message || 'Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Đang xác thực liên kết khôi phục mật khẩu...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-red-100 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-full mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Liên kết không hợp lệ</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {tokenError}
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/forgot-password"
              className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              Yêu cầu liên kết mới
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Đăng nhập
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-sm">
            Vui lòng nhập mật khẩu mới siêu bảo mật của bạn
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Nhập mật khẩu mới..."
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Xác nhận mật khẩu mới..."
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Validation Indicator List */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs font-medium text-slate-600">
            <p className="font-bold text-slate-700 mb-1">Mật khẩu mới của bạn phải đạt:</p>
            <div className="flex items-center gap-2">
              {hasMinLength ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
              <span className={hasMinLength ? "text-emerald-700" : "text-slate-500"}>Tối thiểu 8 ký tự</span>
            </div>
            <div className="flex items-center gap-2">
              {hasUppercase ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
              <span className={hasUppercase ? "text-emerald-700" : "text-slate-500"}>Ít nhất 1 chữ viết hoa</span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
              <span className={hasNumber ? "text-emerald-700" : "text-slate-500"}>Ít nhất 1 chữ số</span>
            </div>
            <div className="flex items-center gap-2">
              {hasSpecialChar ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
              <span className={hasSpecialChar ? "text-emerald-700" : "text-slate-500"}>Ít nhất 1 ký tự đặc biệt (!@#...)</span>
            </div>
            <div className="flex items-center gap-2">
              {passwordsMatch ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
              <span className={passwordsMatch ? "text-emerald-700" : "text-slate-500"}>Hai mật khẩu trùng khớp</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full flex items-center justify-center py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm transition-colors shadow-md gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang cập nhật mật khẩu...
              </>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
