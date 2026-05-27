import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => isNaN(char))) return;
    
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      newOtp[index] = value;
    });
    setOtp(newOtp);
    
    if (pastedData.length === 6) {
      inputRefs.current[5].focus();
    } else {
      inputRefs.current[pastedData.length].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setIsVerifying(true);
    try {
      await api.post('/auth/verify-email', { email, otp: otpString });
      toast.success('Tài khoản đã được xác thực thành công!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Mã OTP mới đã được gửi đến email của bạn');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, không thể gửi lại mã');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác thực tài khoản</h2>
          <p className="text-gray-500 text-sm">
            Chúng tôi đã gửi mã xác nhận 6 số đến email <br/>
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otp.join('').length !== 6}
            className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all
              ${isVerifying || otp.join('').length !== 6
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
              }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Đang xác thực...
              </>
            ) : (
              'Xác nhận'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Bạn chưa nhận được mã?{' '}
            {canResend ? (
              <button 
                onClick={handleResend}
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Gửi lại mã
              </button>
            ) : (
              <span className="font-semibold text-gray-400">
                Gửi lại sau {countdown}s
              </span>
            )}
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
