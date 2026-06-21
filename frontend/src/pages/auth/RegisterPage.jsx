import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const schema = yup.object().shape({
  fullName: yup.string().required('Vui lòng nhập họ và tên'),
  username: yup.string().required('Vui lòng nhập tên tài khoản').min(4, 'Tên tài khoản tối thiểu 4 ký tự'),
  email: yup.string().email('Email không đúng định dạng').required('Vui lòng nhập email'),
  phone: yup.string().matches(/^[0-9]+$/, 'Số điện thoại chỉ được chứa chữ số').min(10, 'Số điện thoại tối thiểu 10 số').required('Vui lòng nhập số điện thoại'),
  password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
  agreeTerms: yup.boolean().oneOf([true], 'Bạn phải đồng ý với điều khoản dịch vụ'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', {
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mb-4 flex justify-start">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white font-black text-xl mb-6 shadow-md hover:bg-blue-700 transition-colors">
            PD
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
          <p className="text-gray-500">
            Điền đầy đủ thông tin để trở thành thành viên
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="nguyenvana123"
                />
              </div>
              {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="0912345678"
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Agree Terms */}
          <div className="flex items-center">
            <input
              {...register('agreeTerms')}
              id="agree-terms"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Tôi đồng ý với các <Link to="#" className="text-blue-600 hover:text-blue-500">điều khoản dịch vụ</Link>
            </label>
          </div>
          {errors.agreeTerms && <p className="text-sm text-red-500 mt-1">{errors.agreeTerms.message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white ${
              !isValid || isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors mt-6`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Đang xử lý...
              </>
            ) : (
              <>
                Đăng Ký Tài Khoản
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center mt-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-sm text-gray-400 font-medium">Hoặc đăng ký bằng</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social Login */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.href = '/oauth2/authorization/google'}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng ký bằng Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100 mt-8">
          <p className="text-sm text-gray-600">
            Bạn đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
