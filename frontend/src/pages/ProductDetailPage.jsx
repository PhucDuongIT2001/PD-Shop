import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, ArrowLeft, Star, Plus, Minus, Loader2,
  Shield, Truck, RotateCcw, Heart, Box, CheckCircle2, MessageSquare, Send
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [arAsset, setArAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const modelRef = useRef(null);
  const arContainerRef = useRef(null);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [255, 255, 255];
  };

  const handleColorChange = (colorHex) => {
    if (modelRef.current && modelRef.current.model) {
      const [r, g, b] = hexToRgb(colorHex);
      modelRef.current.model.materials.forEach(material => {
        if (material && material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.setBaseColorFactor([r/255, g/255, b/255, 1]);
        }
      });
    }
  };

  // Mount model-viewer via raw DOM API to avoid React property/attribute confusion
  useEffect(() => {
    if (!showAR || !arAsset || !arContainerRef.current) return;

    const container = arContainerRef.current;
    // Remove any existing model-viewer
    const existing = container.querySelector('model-viewer');
    if (existing) container.removeChild(existing);

    const mv = document.createElement('model-viewer');
    const src = arAsset.modelGlbUrl?.startsWith('http') || arAsset.modelGlbUrl?.startsWith('/')
      ? arAsset.modelGlbUrl
      : `/uploads/${arAsset.modelGlbUrl}`;

    mv.setAttribute('src', src);
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('ar', '');
    mv.setAttribute('ar-modes', 'scene-viewer webxr quick-look');
    if (arAsset.modelUsdzUrl) {
      const usdzSrc = arAsset.modelUsdzUrl?.startsWith('http') || arAsset.modelUsdzUrl?.startsWith('/')
        ? arAsset.modelUsdzUrl : `/uploads/${arAsset.modelUsdzUrl}`;
      mv.setAttribute('ios-src', usdzSrc);
    }
    if (arAsset.environmentMapUrl) {
      mv.setAttribute('environment-image', arAsset.environmentMapUrl);
    }
    mv.style.display = 'block';
    mv.style.width = '100%';
    mv.style.height = '100%';
    modelRef.current = mv;

    container.appendChild(mv);

    return () => {
      if (container.contains(mv)) container.removeChild(mv);
    };
  }, [showAR, arAsset]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/products/${id}/reviews`);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        // Fetch AR Asset
        try {
          const arRes = await api.get(`/products/${id}/ar-asset`);
          if (arRes.data && (arRes.data.modelGlbUrl || arRes.data.modelUsdzUrl)) {
            setArAsset(arRes.data);
          }
        } catch (arErr) {
          // AR asset not found, ignore
        }
      } catch (err) {
        // Try to find it in localStorage mock products
        const savedMock = localStorage.getItem('mockProducts');
        let foundMock = null;
        if (savedMock) {
          const mockProducts = JSON.parse(savedMock);
          foundMock = mockProducts.find(p => p.id.toString() === id);
        }
        
        if (foundMock) {
          setProduct(foundMock);
          if (foundMock.arAsset) {
            setArAsset(foundMock.arAsset);
          } else if (foundMock.arModelUrl) {
            setArAsset({
              modelGlbUrl: foundMock.arModelUrl,
              modelUsdzUrl: foundMock.arModelUrl,
            });
          }
        } else {
          toast.error('Không tìm thấy sản phẩm');
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (success) {
      // toast already shown in context
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (success) navigate('/cart');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newRating) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: newRating,
        comment: newComment
      });
      toast.success("Đã gửi đánh giá thành công!");
      setNewComment("");
      setNewRating(5);
      fetchReviews(); // Reload reviews list
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể gửi đánh giá. Lưu ý: Bạn cần phải mua sản phẩm này trước khi đánh giá.";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formattedPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const stockQty = product.stockQuantity ?? product.stock ?? 0;
  const inStock = stockQty > 0;

  return (
    <div className="flex-grow bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-blue-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <nav className="text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-800 font-bold">{product.name}</span>
          </nav>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 mb-16">
          {/* Product Image / AR Viewer */}
          <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 relative group ${showAR && arAsset ? 'p-0 h-[460px]' : 'p-8 flex items-center justify-center min-h-[400px] overflow-hidden'}`}>
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 z-20 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-lg shadow-red-600/20 italic">
                -{product.discount}%
              </div>
            )}
            
            <button className="absolute top-4 right-4 z-20 p-2.5 bg-slate-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all">
              <Heart className="w-5 h-5" />
            </button>

            {arAsset && (
              <button
                onClick={() => setShowAR(!showAR)}
                className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                <Box className="w-4 h-4" />
                {showAR ? 'Xem ảnh 2D' : 'Xem 3D / AR'}
              </button>
            )}

            {showAR && arAsset ? (
              <div
                ref={arContainerRef}
                style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', backgroundColor: '#e8edf2' }}
              >
                {/* model-viewer is mounted here via useEffect DOM API */}

                {/* Color Switcher UI */}
                {arAsset.availableColors && (
                  <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Chọn màu 3D</span>
                    <div className="flex items-center gap-2">
                      {arAsset.availableColors.split(',').map((colorHex, index) => (
                        <button
                          key={index}
                          onClick={() => handleColorChange(colorHex.trim())}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95"
                          style={{ backgroundColor: colorHex.trim() }}
                          title={`Màu ${colorHex}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <img
                src={getProductImageUrl(product.image || product.thumbnail)}
                alt={product.name}
                className="max-h-[380px] w-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Title & Rating */}
            <div>
              {product.categoryName && (
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest italic mb-2 block">
                  {product.categoryName}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current text-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-500 font-bold">
                  {averageRating > 0 ? `${averageRating}/5` : 'Chưa có'} ({totalReviews} đánh giá)
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  inStock
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {inStock ? `Còn hàng (${stockQty})` : 'Hết hàng'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-red-600 tracking-tighter">
                  {formattedPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <span className="text-lg text-slate-400 line-through font-bold mb-1">
                    {formattedPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-sm text-emerald-600 font-bold mt-1">
                  Tiết kiệm {formattedPrice((product.oldPrice || 0) - product.price)}
                </p>
              )}
            </div>

            {/* Description */}
            {product.shortDescription && (
              <p className="text-slate-600 leading-relaxed text-sm">{product.shortDescription}</p>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Số lượng:</span>
              <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-all active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-black text-slate-800 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(stockQty || 99, q + 1))}
                  disabled={quantity >= stockQty}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !inStock}
                className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed italic"
              >
                {addingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={addingToCart || !inStock}
                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed italic"
              >
                Mua ngay
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Miễn phí vận chuyển' },
                { icon: Shield, label: 'Bảo hành chính hãng' },
                { icon: RotateCcw, label: 'Đổi trả 30 ngày' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-white rounded-2xl p-3 border border-slate-100 text-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-slate-600 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Detailed Description & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Detailed Description */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-6 border-b border-slate-100 pb-4">
              Mô tả chi tiết
            </h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p>Chưa có thông tin mô tả chi tiết cho sản phẩm này.</p>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-6 border-b border-slate-100 pb-4">
              Thông số kỹ thuật
            </h2>
            <div className="space-y-3">
              {product.fullSpecifications ? (
                <div className="text-sm text-slate-600 space-y-2">
                  {(product.fullSpecifications.includes('\n')
                    ? product.fullSpecifications.split('\n')
                    : product.fullSpecifications.split(';')
                  )
                    .map(spec => spec.trim())
                    .filter(spec => spec.length > 0)
                    .map((spec, i) => {
                      const parts = spec.split(':');
                      if (parts.length > 1) {
                        return (
                          <div key={i} className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                            <span className="font-bold text-slate-800">{parts[0].trim()}</span>
                            <span className="col-span-2 text-slate-600">{parts.slice(1).join(':').trim()}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="py-1">{spec}</p>;
                    })}
                </div>
              ) : !arAsset ? (
                <p className="text-sm text-slate-400 italic">Đang cập nhật thông số kỹ thuật...</p>
              ) : null}

              {arAsset && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4 italic">
                    ✦ Thông số 3D & Thực tế ảo (AR)
                  </span>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                      <span className="font-bold text-slate-800">Trải nghiệm AR</span>
                      <span className="col-span-2 text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Hỗ trợ xem 3D / AR
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                      <span className="font-bold text-slate-800">Kiểu hiển thị</span>
                      <span className="col-span-2 text-slate-600 capitalize">
                        {arAsset.arType === 'floor' ? 'Đặt trên sàn nhà (Floor)' :
                         arAsset.arType === 'wall' ? 'Treo trên tường (Wall)' :
                         arAsset.arType === 'table' ? 'Đặt trên mặt bàn (Table)' :
                         'Tự động nhận diện (Auto)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                      <span className="font-bold text-slate-800">Tỷ lệ thu phóng</span>
                      <span className="col-span-2 text-slate-600 font-medium">
                        {arAsset.scaleFactor ? `${arAsset.scaleFactor * 100}% (x${arAsset.scaleFactor})` : '100% (x1.0)'}
                      </span>
                    </div>
                    {arAsset.availableColors && (
                      <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                        <span className="font-bold text-slate-800">Màu sắc 3D</span>
                        <span className="col-span-2 text-slate-600">{arAsset.availableColors}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                      <span className="font-bold text-slate-800">Mô hình GLB</span>
                      <span className="col-span-2 text-blue-500 font-semibold truncate hover:underline cursor-pointer" onClick={() => window.open(getProductImageUrl(arAsset.modelGlbUrl), '_blank')}>
                        {arAsset.modelGlbUrl?.substring(arAsset.modelGlbUrl.lastIndexOf('/') + 1) || 'Xem mô hình'}
                      </span>
                    </div>
                    {arAsset.modelUsdzUrl && (
                      <div className="grid grid-cols-3 py-2 border-b border-slate-50 last:border-0 gap-2">
                        <span className="font-bold text-slate-800">Mô hình USDZ</span>
                        <span className="col-span-2 text-blue-500 font-semibold truncate hover:underline cursor-pointer" onClick={() => window.open(getProductImageUrl(arAsset.modelUsdzUrl), '_blank')}>
                          {arAsset.modelUsdzUrl?.substring(arAsset.modelUsdzUrl.lastIndexOf('/') + 1) || 'Xem mô hình'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" /> Đánh giá từ khách hàng
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Overall score */}
            <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-6 text-center border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{averageRating}</span>
              <div className="flex items-center text-yellow-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? 'fill-current text-yellow-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-bold">Xếp hạng trung bình</p>
              <p className="text-xs text-slate-400 mt-1">Dựa trên {totalReviews} lượt đánh giá thực tế</p>
            </div>

            {/* Right: Reviews List & Form */}
            <div className="lg:col-span-8 space-y-8">
              {/* Form Write Review */}
              {user ? (
                <div className="bg-blue-50/55 rounded-3xl p-6 border border-blue-100/50">
                  <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight italic mb-4">
                    Viết nhận xét của bạn
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đánh giá sao:</label>
                      <div className="flex gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-all duration-150 transform hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= (hoverRating || newRating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bình luận chi tiết:</label>
                      <textarea
                        id="comment"
                        rows="4"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Hãy chia sẻ cảm nhận thực tế của bạn về chất lượng sản phẩm..."
                        className="w-full bg-white border border-slate-200 text-slate-800 p-4 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                        required
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:bg-slate-300"
                    >
                      {submittingReview ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-6 text-center border border-slate-100">
                  <p className="text-slate-500 text-sm font-medium">
                    Bạn cần{' '}
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">
                      Đăng nhập
                    </Link>{' '}
                    để có thể gửi đánh giá cho sản phẩm này.
                  </p>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight italic mb-4">
                  Nhận xét gần đây
                </h3>

                {reviewsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 text-sm font-medium italic">Sản phẩm này chưa có lượt đánh giá nào. Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{review.username}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current text-yellow-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mt-1">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
