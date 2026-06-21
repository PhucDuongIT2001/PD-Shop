import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Filter, MoreVertical,
  Edit, Trash2, Eye, Download, Upload, Boxes, AlertCircle, X
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
  const [productList, setProductList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'OUT_OF_STOCK', 'LOW_STOCK', 'ACTIVE'
  const importFileRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      const data = res.data;
      if (data && Array.isArray(data.content)) {
        setProductList(data.content);
      } else if (Array.isArray(data)) {
        setProductList(data);
      } else {
        setProductList([]);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách sản phẩm');
      setProductList([]);
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands')
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
    } catch (err) {
      console.error('Error fetching categories or brands', err);
      setCategories([]);
      setBrands([]);
    }
  };
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    categoryId: '',
    brandId: '',
    price: '',
    oldPrice: '',
    stock: '',
    sku: '',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1505156868547-9b49f4df4e04?auto=format&fit=crop&q=80&w=400',
    arModelUrl: '',
    glbFile: null,
    description: ''
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Vui lòng nhập tên và giá sản phẩm!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('price', newProduct.price);
      formData.append('stockQuantity', newProduct.stock || 0);
      formData.append('description', newProduct.description || '');
      formData.append('status', newProduct.status || 'ACTIVE');
      formData.append('sku', newProduct.sku || '');
      
      if (newProduct.categoryId) {
        formData.append('categoryId', newProduct.categoryId);
      }
      if (newProduct.brandId) {
        formData.append('brandId', newProduct.brandId);
      }

      if (newProduct.thumbnailFile) {
        formData.append('thumbnail', newProduct.thumbnailFile);
      }
      if (newProduct.arModelUrl) {
        formData.append('modelGlbUrl', newProduct.arModelUrl);
      }

      const res = await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Nếu có chọn tệp tin GLB từ máy, thực hiện upload qua endpoint AR Asset
      if (newProduct.glbFile && res.data?.id) {
        const arFormData = new FormData();
        arFormData.append('glbFile', newProduct.glbFile);
        arFormData.append('arType', 'auto');
        arFormData.append('scaleFactor', 1.0);
        await api.post(`/admin/products/${res.data.id}/ar-asset`, arFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast.success('Thêm sản phẩm thành công!');
      setIsAddModalOpen(false);
      setNewProduct({
        name: '', categoryId: '', brandId: '', price: '', oldPrice: '', stock: '', sku: '', status: 'ACTIVE', image: '', thumbnailFile: null, imagePreview: null, arModelUrl: '', glbFile: null, description: ''
      });
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi khi thêm sản phẩm');
      console.error(err);
    }
  };

  const openEditModal = (product) => {
    const existingArAsset = product.arAssets && product.arAssets.length > 0 ? product.arAssets[0] : null;
    setEditingProduct({
      ...product,
      categoryId: product.categoryId || product.category?.id || '',
      brandId: product.brandId || product.brand?.id || '',
      stock: product.quantity || product.stock || 0,
      sku: product.sku || '',
      arModelUrl: existingArAsset ? (existingArAsset.modelGlbUrl || '') : '',
      glbFile: null
    });
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) {
      toast.error('Vui lòng nhập tên và giá sản phẩm!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('price', editingProduct.price);
      formData.append('stockQuantity', editingProduct.stock || 0);
      formData.append('description', editingProduct.description || '');
      formData.append('status', editingProduct.status || 'ACTIVE');
      formData.append('sku', editingProduct.sku || '');
      
      if (editingProduct.categoryId) {
        formData.append('categoryId', editingProduct.categoryId);
      }
      if (editingProduct.brandId) {
        formData.append('brandId', editingProduct.brandId);
      }

      if (editingProduct.thumbnailFile) {
        formData.append('thumbnail', editingProduct.thumbnailFile);
      }
      if (editingProduct.arModelUrl) {
        formData.append('modelGlbUrl', editingProduct.arModelUrl);
      }

      await api.put(`/admin/products/${editingProduct.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Nếu có chọn tệp tin GLB từ máy, thực hiện upload qua endpoint AR Asset
      if (editingProduct.glbFile) {
        const arFormData = new FormData();
        arFormData.append('glbFile', editingProduct.glbFile);
        arFormData.append('arType', 'auto');
        arFormData.append('scaleFactor', 1.0);
        await api.post(`/admin/products/${editingProduct.id}/ar-asset`, arFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast.success('Cập nhật sản phẩm thành công!');
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Lỗi khi cập nhật sản phẩm');
      console.error(err);
    }
  };

  const handleFileChange = (e, field, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (field === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isEdit) {
            setEditingProduct({ ...editingProduct, thumbnailFile: file, imagePreview: reader.result });
          } else {
            setNewProduct({ ...newProduct, thumbnailFile: file, imagePreview: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset so the same file can be re-selected after an error
    e.target.value = '';
    const formData = new FormData();
    formData.append('file', file);
    setIsImporting(true);
    try {
      const res = await api.post('/admin/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data?.message || 'Import Excel thành công!');
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi import file Excel.';
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = productList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const stock = p.quantity || p.stock || p.stockQuantity || 0;
    
    let matchesType = true;
    if (filterType === 'OUT_OF_STOCK') {
      matchesType = stock === 0;
    } else if (filterType === 'LOW_STOCK') {
      matchesType = stock > 0 && stock <= 10;
    } else if (filterType === 'ACTIVE') {
      matchesType = p.status === 'ACTIVE';
    }
    
    return matchesSearch && matchesType;
  });

  const outOfStockCount = productList.filter(p => (p.quantity || p.stock || p.stockQuantity || 0) === 0).length;
  const lowStockCount = productList.filter(p => {
    const stock = p.quantity || p.stock || p.stockQuantity || 0;
    return stock > 0 && stock <= 10;
  }).length;
  const activeCount = productList.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Quản Lý Sản Phẩm</h2>
          <p className="text-slate-500 font-medium">Bạn có tổng cộng {productList.length} sản phẩm đang kinh doanh.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden file input for Excel import */}
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={importFileRef}
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-sm border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {isImporting ? 'Đang nhập...' : 'Nhập Excel'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 font-bold rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-black uppercase italic tracking-tighter rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" /> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { id: 'ALL', label: 'Tất cả', count: productList.length, icon: Boxes, color: 'text-slate-600 bg-slate-100' },
          { id: 'OUT_OF_STOCK', label: 'Hết hàng', count: outOfStockCount, icon: AlertCircle, color: 'text-red-600 bg-red-100' },
          { id: 'LOW_STOCK', label: 'Sắp hết hàng', count: lowStockCount, icon: AlertCircle, color: 'text-amber-600 bg-amber-100' },
          { id: 'ACTIVE', label: 'Đang hoạt động', count: activeCount, icon: Boxes, color: 'text-blue-600 bg-blue-100' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setFilterType(stat.id)}
            className={`bg-white p-6 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${filterType === stat.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-blue-200'}`}
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase italic tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-900 italic tracking-tighter">{stat.count} Sản phẩm</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên..." 
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 italic">
                <th className="px-8 py-5">Sản phẩm</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Giá bán</th>
                <th className="px-8 py-5">Tồn kho</th>
                <th className="px-8 py-5">Trạng thái</th>
                <th className="px-8 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product, i) => (
                <tr key={product.id || i} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img src={product.thumbnail || product.image || 'https://placehold.co/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 italic tracking-tighter uppercase line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: {product.sku || 'PROD-00' + product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-tight">{product.category?.name || product.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-blue-600 italic tracking-tighter">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-700 italic">{product.quantity || product.stock || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {(() => {
                      const stock = product.quantity || product.stock || product.stockQuantity || 0;
                      if (product.status === 'INACTIVE' || product.status === 'HIDDEN') {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase italic tracking-widest">
                            <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                            Đã ẩn
                          </span>
                        );
                      }
                      if (stock === 0 || product.status === 'OUT_OF_STOCK') {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase italic tracking-widest">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                            Hết hàng
                          </span>
                        );
                      }
                      if (stock > 0 && stock <= 10) {
                        return (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase italic tracking-widest">
                            <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-pulse"></div>
                            Sắp hết
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase italic tracking-widest">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                          Đang bán
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        onClick={() => openEditModal(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc muốn xoá sản phẩm này?')) {
                            try {
                              await api.delete(`/admin/products/${product.id}`);
                              toast.success('Đã xóa sản phẩm!');
                              fetchProducts();
                            } catch (e) { toast.error('Lỗi khi xoá!'); }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Thêm Sản Phẩm Mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên sản phẩm *</label>
                  <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Nhập tên sản phẩm..."/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mã sản phẩm (SKU) *</label>
                  <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Ví dụ: SKU-IPHONE15"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
                  <select value={newProduct.status} onChange={e => setNewProduct({...newProduct, status: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="ACTIVE">Đang bán (Active)</option>
                    <option value="INACTIVE">Ẩn sản phẩm (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Danh mục *</label>
                  <select required value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thương hiệu *</label>
                  <select required value={newProduct.brandId} onChange={e => setNewProduct({...newProduct, brandId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá bán (VNĐ) *</label>
                  <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Ví dụ: 15000000"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tồn kho</label>
                  <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="0"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả sản phẩm</label>
                <textarea rows="4" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium resize-none" placeholder="Nhập thông số kỹ thuật, mô tả chi tiết sản phẩm..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hình ảnh sản phẩm (Tải lên)</label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image', false)} className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {newProduct.imagePreview ? (
                      <img src={newProduct.imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                    ) : newProduct.image ? (
                      <img src={newProduct.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tải lên file AR Model (.glb)</label>
                  <input type="file" accept=".glb" onChange={e => setNewProduct({...newProduct, glbFile: e.target.files[0]})} className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Hoặc dán Link URL:</span>
                    <input type="text" value={newProduct.arModelUrl || ''} onChange={e => setNewProduct({...newProduct, arModelUrl: e.target.value})} className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium" placeholder="https://.../model.glb"/>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all">
                  Hủy bỏ
                </button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-black italic uppercase tracking-tighter rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-800">Sửa Sản Phẩm</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditProduct} className="p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tên sản phẩm *</label>
                  <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Nhập tên sản phẩm..."/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mã sản phẩm (SKU) *</label>
                  <input type="text" required value={editingProduct.sku} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Ví dụ: SKU-IPHONE15"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Trạng thái</label>
                  <select value={editingProduct.status} onChange={e => setEditingProduct({...editingProduct, status: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="ACTIVE">Đang bán (Active)</option>
                    <option value="INACTIVE">Ẩn sản phẩm (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Danh mục *</label>
                  <select required value={editingProduct.categoryId} onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Thương hiệu *</label>
                  <select required value={editingProduct.brandId} onChange={e => setEditingProduct({...editingProduct, brandId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium">
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Giá bán (VNĐ) *</label>
                  <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="Ví dụ: 15000000"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tồn kho</label>
                  <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium" placeholder="0"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Mô tả sản phẩm</label>
                <textarea rows="4" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium resize-none" placeholder="Nhập thông số kỹ thuật, mô tả chi tiết sản phẩm..."></textarea>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hình ảnh sản phẩm (Tải lên)</label>
                  <div className="flex items-center gap-4">
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image', true)} className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {editingProduct.imagePreview ? (
                      <img src={editingProduct.imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                    ) : (editingProduct.thumbnail || editingProduct.image) ? (
                      <img src={editingProduct.thumbnail || editingProduct.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200" />
                    ) : null}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tải lên file AR Model (.glb)</label>
                  <input type="file" accept=".glb" onChange={e => setEditingProduct({...editingProduct, glbFile: e.target.files[0]})} className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400">Hoặc dán Link URL:</span>
                    <input type="text" value={editingProduct.arModelUrl || ''} onChange={e => setEditingProduct({...editingProduct, arModelUrl: e.target.value})} className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-blue-500/20 outline-none text-xs font-medium" placeholder="https://.../model.glb"/>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all">
                  Hủy bỏ
                </button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-black italic uppercase tracking-tighter rounded-xl text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
