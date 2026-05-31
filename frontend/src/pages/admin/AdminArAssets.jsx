import React, { useState, useEffect } from 'react';
import {
  Box, Search, Link2, Trash2, Save, Loader2,
  CheckCircle2, AlertTriangle, Package, Plus, Eye, EyeOff
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminArAssets = () => {
  const [allAssets, setAllAssets] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // productId being saved

  // Form state: productId -> { modelGlbUrl, modelUsdzUrl, arType, scaleFactor }
  const [forms, setForms] = useState({});
  const [previewId, setPreviewId] = useState(null); // productId with expanded preview

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assetsRes, productsRes] = await Promise.all([
        api.get('/products/ar-assets'),
        api.get('/products'),
      ]);

      const assetsList = assetsRes.data || [];
      const productsList = (productsRes.data?.content || productsRes.data || []);

      setAllAssets(assetsList);
      setProducts(productsList);

      // Initialize forms from existing assets
      const initialForms = {};
      assetsList.forEach(asset => {
        initialForms[asset.productId] = {
          modelGlbUrl: asset.modelGlbUrl || '',
          modelUsdzUrl: asset.modelUsdzUrl || '',
          glbFile: null,
          usdzFile: null,
          arType: asset.arType || 'auto',
          scaleFactor: asset.scaleFactor || 1.0,
        };
      });
      setForms(initialForms);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách AR assets');
    } finally {
      setLoading(false);
    }
  };

  const getFormForProduct = (productId) => {
    return forms[productId] || { modelGlbUrl: '', modelUsdzUrl: '', glbFile: null, usdzFile: null, arType: 'auto', scaleFactor: 1.0 };
  };

  const updateForm = (productId, field, value) => {
    setForms(prev => ({
      ...prev,
      [productId]: {
        ...getFormForProduct(productId),
        [field]: value,
      }
    }));
  };

  const saveAsset = async (productId) => {
    const form = getFormForProduct(productId);
    if (!form.modelGlbUrl.trim() && !form.modelUsdzUrl.trim() && !form.glbFile && !form.usdzFile) {
      toast.error('Vui lòng nhập URL hoặc tải lên ít nhất một mô hình (GLB hoặc USDZ)');
      return;
    }
    try {
      setSaving(productId);
      
      const formData = new FormData();
      if (form.modelGlbUrl.trim()) formData.append('modelGlbUrl', form.modelGlbUrl.trim());
      if (form.modelUsdzUrl.trim()) formData.append('modelUsdzUrl', form.modelUsdzUrl.trim());
      formData.append('arType', form.arType || 'auto');
      formData.append('scaleFactor', parseFloat(form.scaleFactor) || 1.0);
      
      if (form.glbFile) formData.append('glbFile', form.glbFile);
      if (form.usdzFile) formData.append('usdzFile', form.usdzFile);

      await api.post(`/admin/products/${productId}/ar-asset`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Đã lưu AR asset thành công!');
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu AR asset');
    } finally {
      setSaving(null);
    }
  };

  const deleteAsset = async (productId, productName) => {
    if (!window.confirm(`Xóa AR asset của sản phẩm "${productName}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await api.delete(`/admin/products/${productId}/ar-asset`);
      toast.success('Đã xóa AR asset!');
      setForms(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa AR asset');
    }
  };

  const assetMap = {};
  allAssets.forEach(a => { assetMap[a.productId] = a; });

  const filteredProducts = products.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id?.toString() || '').includes(searchTerm)
  );

  const productsWithAssets = filteredProducts.filter(p => assetMap[p.id]);
  const productsWithoutAssets = filteredProducts.filter(p => !assetMap[p.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-slate-500 font-semibold">Đang tải dữ liệu AR...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Box className="w-7 h-7 text-blue-600" />
            Quản lý AR Assets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gán URL mô hình 3D (.glb / .usdz) cho sản phẩm để sử dụng trong AR Studio
          </p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs font-black text-blue-900">{allAssets.length} / {products.length}</p>
            <p className="text-[10px] text-blue-600 font-semibold">Sản phẩm có AR</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
      </div>

      {/* Products With AR Assets */}
      {productsWithAssets.length > 0 && (
        <div>
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Đã có AR Asset ({productsWithAssets.length})
          </h2>
          <div className="space-y-3">
            {productsWithAssets.map(product => {
              const asset = assetMap[product.id];
              const form = getFormForProduct(product.id);
              const isExpanded = previewId === product.id;
              const isSavingThis = saving === product.id;

              return (
                <div key={product.id} className="bg-white border border-green-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Product Header */}
                  <div className="flex items-center justify-between p-4 bg-green-50/50">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail || 'https://placehold.co/48'}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-green-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">ID: {product.id} · {new Intl.NumberFormat('vi-VN').format(product.price || 0)} đ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-green-700 bg-green-100 rounded-full px-2 py-1 uppercase tracking-wider">
                        ✅ AR Enabled
                      </span>
                      <button
                        onClick={() => setPreviewId(isExpanded ? null : product.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAsset(product.id, product.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="p-4 border-t border-green-100 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            File hoặc URL Model GLB (Android / Web)
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".glb"
                              onChange={e => updateForm(product.id, 'glbFile', e.target.files[0])}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">hoặc URL:</span>
                              <input
                                type="url"
                                placeholder="https://s3.amazonaws.com/bucket/model.glb"
                                value={form.modelGlbUrl}
                                onChange={e => updateForm(product.id, 'modelGlbUrl', e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            File hoặc URL Model USDZ (iOS)
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".usdz"
                              onChange={e => updateForm(product.id, 'usdzFile', e.target.files[0])}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">hoặc URL:</span>
                              <input
                                type="url"
                                placeholder="https://s3.amazonaws.com/bucket/model.usdz"
                                value={form.modelUsdzUrl}
                                onChange={e => updateForm(product.id, 'modelUsdzUrl', e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            Loại AR
                          </label>
                          <select
                            value={form.arType}
                            onChange={e => updateForm(product.id, 'arType', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          >
                            <option value="auto">Auto (Tự động)</option>
                            <option value="scene-viewer">Scene Viewer (Android)</option>
                            <option value="quick-look">Quick Look (iOS)</option>
                            <option value="webxr">WebXR</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            Tỷ lệ (Scale Factor)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5.0"
                            value={form.scaleFactor}
                            onChange={e => updateForm(product.id, 'scaleFactor', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveAsset(product.id)}
                          disabled={isSavingThis}
                          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                        >
                          {isSavingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Without AR Assets */}
      {productsWithoutAssets.length > 0 && (
        <div>
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Chưa có AR Asset ({productsWithoutAssets.length})
          </h2>
          <div className="space-y-3">
            {productsWithoutAssets.map(product => {
              const form = getFormForProduct(product.id);
              const isExpanded = previewId === product.id;
              const isSavingThis = saving === product.id;

              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
                  {/* Product Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail || 'https://placehold.co/48'}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">ID: {product.id} · {new Intl.NumberFormat('vi-VN').format(product.price || 0)} đ</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewId(isExpanded ? null : product.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm AR Asset
                    </button>
                  </div>

                  {/* Add Form */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            File hoặc URL Model GLB (Android / Web) *
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".glb"
                              onChange={e => updateForm(product.id, 'glbFile', e.target.files[0])}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">hoặc URL:</span>
                              <input
                                type="url"
                                placeholder="https://s3.amazonaws.com/models/product.glb"
                                value={form.modelGlbUrl}
                                onChange={e => updateForm(product.id, 'modelGlbUrl', e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono bg-white"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            File hoặc URL Model USDZ (iOS) — Tùy chọn
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".usdz"
                              onChange={e => updateForm(product.id, 'usdzFile', e.target.files[0])}
                              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">hoặc URL:</span>
                              <input
                                type="url"
                                placeholder="https://s3.amazonaws.com/models/product.usdz"
                                value={form.modelUsdzUrl}
                                onChange={e => updateForm(product.id, 'modelUsdzUrl', e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-mono bg-white"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            Loại AR
                          </label>
                          <select
                            value={form.arType}
                            onChange={e => updateForm(product.id, 'arType', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                          >
                            <option value="auto">Auto (Tự động)</option>
                            <option value="scene-viewer">Scene Viewer (Android)</option>
                            <option value="quick-look">Quick Look (iOS)</option>
                            <option value="webxr">WebXR</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                            Tỷ lệ (Scale Factor)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5.0"
                            value={form.scaleFactor}
                            onChange={e => updateForm(product.id, 'scaleFactor', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => saveAsset(product.id)}
                          disabled={isSavingThis}
                          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                        >
                          {isSavingThis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Tạo AR Asset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Không tìm thấy sản phẩm nào</p>
        </div>
      )}
    </div>
  );
};

export default AdminArAssets;
