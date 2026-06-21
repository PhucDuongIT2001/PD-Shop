import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Heart, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, toggleSaveForLater, loading } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');

  const activeItems = cart.items ? cart.items.filter(item => !item.saveForLater) : [];
  const savedItems = cart.items ? cart.items.filter(item => item.saveForLater) : [];

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    if (code === 'PDSHOP10' || code === 'MGG10') {
      const discountVal = Math.round((cart.subtotal || 0) * 0.1);
      setDiscount(discountVal);
      setCouponApplied(code);
      toast.success('Áp dụng mã giảm giá 10% thành công!');
    } else if (code === 'PDSHOP20') {
      const discountVal = Math.round((cart.subtotal || 0) * 0.2);
      setDiscount(discountVal);
      setCouponApplied(code);
      toast.success('Áp dụng mã giảm giá 20% thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { couponApplied, discount } });
  };

  if (loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const finalTotal = Math.max(0, (cart.total || 0) - discount);

  return (
    <div className="flex-grow bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Giỏ hàng của bạn <span className="text-blue-600 font-normal not-italic ml-2">({activeItems.length})</span>
          </h1>
        </div>

        {activeItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Giỏ hàng đang trống</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Hãy khám phá hàng ngàn sản phẩm công nghệ tuyệt vời và thêm chúng vào giỏ hàng của bạn nhé!</p>
            <Link to="/" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-black italic uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence>
                {activeItems.map((item) => (
                  <motion.div
                     key={item.id}
                     layout
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 group hover:border-blue-200 transition-all"
                  >
                    <div className="flex gap-4 md:gap-6">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={getProductImageUrl(item.productThumbnail)}
                          alt={item.productName}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900 text-sm md:text-lg truncate group-hover:text-blue-600 transition-colors">
                            {item.productName}
                          </h3>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <p className="text-blue-600 font-black text-lg md:text-xl mb-4">
                          {item.price?.toLocaleString()}₫
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-all active:scale-90"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-black text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 transition-all active:scale-90"
                              disabled={item.quantity >= item.stockQuantity}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleSaveForLater(item.id)}
                              className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-all"
                            >
                              <Heart className="w-4 h-4" /> Để mua sau
                            </button>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thành tiền</p>
                              <p className="font-black text-slate-800">{(item.price * item.quantity).toLocaleString()}₫</p>
                            </div>
                          </div>
                        </div>

                        {item.quantity >= item.stockQuantity && (
                          <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 p-2 rounded-lg border border-amber-100">
                            <Info className="w-4 h-4" />
                            Đã đạt giới hạn tồn kho ({item.stockQuantity})
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Save For Later Section */}
              {savedItems.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-black text-slate-800 mb-4 italic uppercase tracking-tight">Sản phẩm mua sau ({savedItems.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedItems.map(item => (
                      <div key={item.id} className="bg-white/50 border border-dashed border-slate-200 rounded-2xl p-4 flex gap-4">
                        <img src={item.productThumbnail} className="w-16 h-16 object-contain grayscale" alt="" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-500 text-sm truncate">{item.productName}</h4>
                          <button
                            onClick={() => toggleSaveForLater(item.id)}
                            className="mt-2 text-xs font-black text-blue-600 uppercase italic hover:underline"
                          >
                            Chuyển vào giỏ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter">Tổng thanh toán</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Tạm tính ({activeItems.length} sản phẩm)</span>
                    <span>{cart.subtotal?.toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Phí vận chuyển</span>
                    <span className="text-emerald-500">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Mã giảm giá {couponApplied && `(${couponApplied})`}</span>
                    <span className={discount > 0 ? "text-emerald-500" : ""}>-{discount.toLocaleString()}₫</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <span className="text-slate-900 font-black text-xl uppercase italic">Tổng tiền</span>
                    <div className="text-right">
                      <p className="text-3xl font-black text-blue-600 tracking-tighter">{finalTotal.toLocaleString()}₫</p>
                      <p className="text-[10px] text-slate-400 font-bold italic">(Đã bao gồm VAT)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá (MGG10...)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!couponApplied}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-500 transition-all font-bold disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    {couponApplied ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCouponApplied('');
                          setDiscount(0);
                          setCouponCode('');
                          toast.success('Đã hủy áp dụng mã giảm giá');
                        }}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                      >
                        Hủy
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        Áp dụng
                      </button>
                    )}
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-emerald-600 font-bold pl-2">
                      ✓ Đã áp dụng mã <span className="font-black">{couponApplied}</span> (Giảm {couponApplied === 'PDSHOP20' ? '20%' : '10%'})
                    </p>
                  )}

                  <button
                    onClick={handleCheckout}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg italic uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98]"
                  >
                    Tiến hành thanh toán
                  </button>

                  <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Info className="w-3 h-3" /> Cam kết bảo mật thanh toán
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <h4 className="font-black italic uppercase tracking-tighter mb-1">Cần hỗ trợ?</h4>
                  <p className="text-xs text-slate-400 font-medium mb-4">Gọi ngay hotline để được tư vấn miễn phí 24/7</p>
                  <a href="tel:19001234" className="text-2xl font-black text-blue-400 group-hover:text-white transition-colors">1900 1234</a>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
