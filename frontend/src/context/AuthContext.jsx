import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          // Token expired: clear storage silently, do NOT redirect.
          // ProtectedRoute will handle redirecting private pages to /login.
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        // Malformed token: clear storage silently, no redirect.
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/auth/login', { usernameOrEmail, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      toast.success(`Chào mừng trở lại, ${user.username}!`);

      // Redirect based on role
      const role = user.roles[0];
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') navigate('/admin/dashboard');
      else if (role === 'STAFF' || role === 'ROLE_STAFF') navigate('/admin/dashboard');
      else navigate('/');

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      const status = error.response?.status;

      if (status === 401) toast.error('Sai tài khoản hoặc mật khẩu');
      else if (status === 403) toast.error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.');
      else toast.error(message + (error.message ? ' - ' + error.message : ''));

      return { success: false, message, status };
    }
  };

  // User-initiated logout: clear state and navigate to /login.
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Đã đăng xuất thành công');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
