import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Search, X, Loader2, Image, ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    active: true
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    image: '',
    active: true
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands/admin?keyword=' + encodeURIComponent(searchTerm));
      setBrands(res.data.content || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Không thể lấy danh sách thương hiệu từ máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBrands();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Toggle active status
  const toggleActiveStatus = async (brand) => {
    try {
      const updatedBrand = { ...brand, active: !brand.active };
      await api.put(`/brands/${brand.id}`, updatedBrand);
      toast.success(brand.active ? "Đã tạm ẩn thương hiệu" : "Đã kích hoạt thương hiệu");
      setBrands(brands.map(b => 
        b.id === brand.id ? { ...b, active: !b.active } : b
      ));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thay đổi trạng thái thương hiệu");
    }
  };

  // Delete brand
  const deleteBrand = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
    try {
      await api.delete(`/brands/${id}`);
      toast.success("Xóa thương hiệu thành công");
      setBrands(brands.filter(b => b.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa thương hiệu");
    }
  };

  // Handle Add Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/brands', formData);
      toast.success("Thêm thương hiệu thành công!");
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', image: '', active: true });
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/brands/${selectedBrand.id}`, editFormData);
      toast.success("Cập nhật thương hiệu thành công!");
      setIsEditModalOpen(false);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật thương hiệu");
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit modal and pre-fill form
  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setEditFormData({
      name: brand.name,
      description: brand.description || '',
      image: brand.image || '',
      active: brand.active
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý Thương hiệu</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý các thương hiệu, hãng sản xuất đối tác và danh mục logo đi kèm</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all font-bold text-sm"
        >
          <Plus className="w-5 h-5" />
          Thêm thương hiệu
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
            placeholder="Tìm theo tên thương hiệu..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Brand List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-medium">Đang tải danh sách hãng đối tác...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="py-4 px-6 font-semibold">ID</th>
                  <th className="py-4 px-6 font-semibold">Logo</th>
                  <th className="py-4 px-6 font-semibold">Thương hiệu</th>
                  <th className="py-4 px-6 font-semibold">Đường dẫn SEO (Slug)</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map(brand => (
                  <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-500 font-mono">#{brand.id}</td>
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {brand.image ? (
                          <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                          {brand.name}
                        </div>
                        <div className="text-xs text-slate-500 max-w-xs truncate">{brand.description || 'Không có mô tả'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs">
                        {brand.slug}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => toggleActiveStatus(brand)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          brand.active 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${brand.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {brand.active ? 'Đang hoạt động' : 'Tạm ẩn'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button 
                        onClick={() => openEditModal(brand)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteBrand(brand.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {brands.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 font-medium">
                      Chưa có đối tác thương hiệu nào được tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
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
                <h3 className="text-lg font-bold text-slate-800">Thêm thương hiệu mới</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên thương hiệu *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="Nhập tên hãng..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả hãng</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    rows="3"
                    placeholder="Nhập mô tả hãng, khẩu hiệu..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Logo hình ảnh</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    placeholder="https://example.com/logo.png"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="add-active-brand"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="add-active-brand" className="text-sm text-slate-700 font-medium cursor-pointer">Kích hoạt thương hiệu này</label>
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

      {/* Edit Brand Modal */}
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
                <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa hãng đối tác</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tên thương hiệu *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả hãng</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    rows="3"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL Logo hình ảnh</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox"
                    id="edit-active-brand"
                    checked={editFormData.active}
                    onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="edit-active-brand" className="text-sm text-slate-700 font-medium cursor-pointer">Kích hoạt thương hiệu này</label>
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

export default AdminBrands;
