import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    address: ''
  });
  
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile({
        username: res.data.username || '',
        email: res.data.email || '',
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        address: res.data.address || ''
      });
    } catch (error) {
      toast.error('Lỗi khi tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const updateProfileInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
        address: profile.address
      });
      toast.success(res.data.message || 'Cập nhật thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật thông tin');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      const res = await api.put('/profile/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      toast.success(res.data.message || 'Đổi mật khẩu thành công');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 p-8 border-r border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-4xl font-black mb-4 shadow-lg shadow-primary/30">
              {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{profile.fullName || profile.username}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">{profile.email}</p>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'info' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-regular fa-user mr-3"></i> Thông tin cá nhân
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'password' ? 'bg-white shadow-sm text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fa-solid fa-lock mr-3"></i> Đổi mật khẩu
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="w-full md:w-2/3 p-8 md:p-12">
          {activeTab === 'info' && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-8">Hồ Sơ Của Tôi</h2>
              <form onSubmit={updateProfileInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên đăng nhập</label>
                    <input type="text" value={profile.username} disabled className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input type="email" value={profile.email} disabled className="w-full p-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
                  <input type="text" name="fullName" value={profile.fullName} onChange={handleProfileChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium" placeholder="Nhập họ và tên..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
                  <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium" placeholder="Nhập số điện thoại..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ</label>
                  <textarea name="address" value={profile.address} onChange={handleProfileChange} rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium resize-none" placeholder="Nhập địa chỉ giao hàng mặc định..."></textarea>
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg">Lưu Thay Đổi</button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-black text-slate-800 mb-8">Đổi Mật Khẩu</h2>
              <form onSubmit={updatePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu hiện tại</label>
                  <input type="password" name="oldPassword" required value={passwords.oldPassword} onChange={handlePasswordChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium" placeholder="••••••••" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu mới</label>
                  <input type="password" name="newPassword" required minLength="6" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium" placeholder="••••••••" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                  <input type="password" name="confirmPassword" required minLength="6" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all font-medium" placeholder="••••••••" />
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg">Cập Nhật Mật Khẩu</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
