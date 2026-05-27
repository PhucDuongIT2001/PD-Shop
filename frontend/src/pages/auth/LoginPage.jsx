import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

const schema = yup.object().shape({
  usernameOrEmail: yup.string().required('Vui lòng nhập Email hoặc Tài khoản'),
  password: yup.string().required('Vui lòng nhập mật khẩu'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
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
    const result = await login(data.usernameOrEmail, data.password);
    if (!result.success && result.status === 403) {
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(data.usernameOrEmail)}`);
      }, 1500);
    }
    setIsSubmitting(false);
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
          <p className="text-gray-500">
            Vui lòng điền thông tin để tiếp tục
          </p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          
          <Input
            label="Email hoặc Tài khoản"
            icon={<Mail className="h-5 w-5" />}
            placeholder="Nhập email hoặc tài khoản..."
            error={errors.usernameOrEmail?.message}
            {...register('usernameOrEmail')}
          />

          <div className="relative">
             <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                icon={<Lock className="h-5 w-5" />}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
             />
             <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
             >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
             </button>
             <div className="absolute right-0 top-0">
               <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                 Quên mật khẩu?
               </Link>
             </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid}
            isLoading={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md text-base"
          >
            {!isSubmitting && (
              <>
                Đăng Nhập
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
            {isSubmitting && 'Đang xử lý...'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-sm text-gray-400 font-medium">Hoặc đăng nhập bằng</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Social Login */}
        <div>
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
            className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng nhập với Google
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
