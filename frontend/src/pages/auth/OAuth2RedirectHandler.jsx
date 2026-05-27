import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user info using the token
      api.get('/auth/me')
        .then(response => {
          const user = response.data.user;
          localStorage.setItem('user', JSON.stringify(user));
          toast.success(`Đăng nhập thành công, ${user.username}!`);
          
          // Redirect based on roles
          const roles = user.roles || [];
          if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN') || roles.includes('STAFF') || roles.includes('ROLE_STAFF')) {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/';
          }
        })
        .catch(err => {
          console.error("Failed to fetch user profile", err);
          localStorage.removeItem('token');
          toast.error("Đăng nhập thất bại, vui lòng thử lại.");
          navigate('/login');
        });
    } else {
      toast.error("Không nhận được token xác thực.");
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
