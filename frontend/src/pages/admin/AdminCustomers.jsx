import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Lock, Unlock, Search, X, Loader2, UserCheck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    role: 'CUSTOMER'
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch users from API
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setCustomers(res.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Không thể lấy danh sách tài khoản từ máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Block/Unlock account
  const toggleCustomerStatus = async (id, currentStatus) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      toast.success(currentStatus ? "Đã khóa tài khoản thành công" : "Đã mở khóa tài khoản thành công");
      // Update local state
      setCustomers(customers.map(c => 
        c.id === id ? { ...c, enabled: !c.enabled } : c
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thay đổi trạng thái tài khoản");
    }
  };

  // Delete account
  const deleteCustomer = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Xóa tài khoản thành công");
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  // Handle Add Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        roles: [formData.role]
      };
      const res = await api.post('/users', payload);
      toast.success("Thêm tài khoản thành công!");
      setIsAddModalOpen(false);
      // Reset form
      setFormData({ username: '', email: '', password: '', fullName: '', phone: '', role: 'CUSTOMER' });
      // Refresh list
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        email: editFormData.email,
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        roles: [editFormData.role]
      };
      await api.put(`/users/${selectedCustomer.id}`, payload);
      toast.success("Cập nhật tài khoản thành công!");
      setIsEditModalOpen(false);
      // Refresh list
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal and pre-fill form
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    // Get primary role
    const primaryRole = customer.roles && customer.roles.includes('ADMIN') ? 'ADMIN' : 'CUSTOMER';
    setEditFormData({
      email: customer.email,
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      role: primaryRole
    });
    setIsEditModalOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.username && c.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Khách hàng</h2>
          <p className="text-slate-500 text-sm mt-1">Xem, thêm, sửa, xoá và khoá tài khoản người dùng trong hệ thống</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, username..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải danh sách tài khoản...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="py-4 px-6 font-semibold">ID</th>
                  <th className="py-4 px-6 font-semibold">Khách hàng</th>
                  <th className="py-4 px-6 font-semibold">Liên hệ</th>
                  <th className="py-4 px-6 font-semibold">Vai trò</th>
                  <th className="py-4 px-6 font-semibold">Đơn hàng</th>
                  <th className="py-4 px-6 font-semibold">Tổng chi tiêu</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono">#{customer.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-slate-800">{customer.fullName || 'Chưa cập nhật'}</div>
                        <div className="text-xs text-slate-500">@{customer.username}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-slate-800">{customer.email}</div>
                        <div className="text-slate-500">{customer.phone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        {customer.roles && customer.roles.map(role => (
                          <span 
                            key={role}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              role === 'ADMIN' || role === 'ROLE_ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {role === 'ADMIN' || role === 'ROLE_ADMIN' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {customer.orderCount} đơn
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpent)}
                    </td>
                    <td className="py-4 px-6">
                      {customer.enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Bị khoá
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button 
                        onClick={() => toggleCustomerStatus(customer.id, customer.enabled)}
                        className={`p-2 rounded-lg transition-colors inline-flex items-center justify-center ${
                          customer.enabled 
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={customer.enabled ? 'Khoá tài khoản' : 'Mở khoá tài khoản'}
                      >
                        {customer.enabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => openEditModal(customer)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCustomer(customer.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Xoá vĩnh viễn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500 font-medium">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Thêm tài khoản mới</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên tài khoản (Username) *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="Nhập tên đăng nhập..."
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mật khẩu *</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="0912345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium bg-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Xác nhận
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa tài khoản</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sửa tài khoản @{selectedCustomer?.username}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="Nguyễn Văn A"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Số điện thoại</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="0912345678"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vai trò</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium bg-white"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="CUSTOMER">CUSTOMER (Khách hàng)</option>
                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
