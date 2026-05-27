import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, User, Phone, MapPin,
  FileText, CheckCircle2, Loader2, Package
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [form, setForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'COD',
  });

  const [errors, setErrors] = useState({});

  const activeItems = cart.items ? cart.items.filter(i => !i.saveForLater) : [];

  const validate = () => {
    const newErrors = {};
    if (!form.shippingName.trim()) newErrors.shippingName = 'Vui lòng nhập tên người nhận';
    if (!form.shippingPhone.trim()) newErrors.shippingPhone = 'Vui lòng nhập số điện thoại';
    else if (!/^[0-9+\-\s]{7,20}$/.test(form.shippingPhone))
      newErrors.shippingPhone = 'Số điện thoại không hợp lệ';
    if (!form.shippingAddress.trim()) newErrors.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/orders/checkout', {
        shippingName: form.shippingName.trim(),
        shippingPhone: form.shippingPhone.trim(),
        shippingAddress: form.shippingAddress.trim(),
        paymentMethod: form.paymentMethod,
        note: form.note.trim() || null,
      });

      await fetchCart(); // refresh cart (should be empty now)

      if (form.paymentMethod === 'VNPAY') {
        const paymentUrl = res.data.paymentUrl;
        if (paymentUrl) {
          toast.success('Đang chuyển đến cổng thanh toán VNPay...');
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          toast.error('Không tạo được link thanh toán VNPay. Vui lòng thử lại.');
        }
        return;
      }

      // COD
      setOrderSuccess(res.data);
      toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="flex-grow bg-slate-50 py-12">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-slate-500 mb-6">
              Mã đơn hàng của bạn: <span className="font-black text-blue-600">#{orderSuccess.id}</span>
            </p>

            {orderSuccess.paymentMethod === 'VNPAY' && (
              <div className="bg-orange-50 border border-orange-100 text-orange-800 p-5 rounded-3xl text-sm font-bold mb-8 text-left leading-relaxed">
                🔔 <span className="uppercase text-xs font-black tracking-wider text-orange-600 block mb-1">Xác thực Email để thanh toán VNPAY</span>
                Hệ thống vừa gửi cho bạn một email chứa **Liên kết thanh toán VNPay bảo mật**. Vui lòng kiểm tra hộp thư của bạn và nhấn vào liên kết đó để hoàn tất thủ tục thanh toán.
                <br />
                <span className="text-xs font-medium text-orange-500 mt-1 block">Lưu ý: Tồn kho sản phẩm chỉ được trừ đi sau khi bạn thanh toán thành công!</span>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 mb-8 border border-slate-100">
              <h3 className="font-black text-slate-800 uppercase italic tracking-tight mb-4">Thông tin giao hàng</h3>
              <div className="flex gap-3 text-sm">
                <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-bold">{orderSuccess.shippingName}</span>
              </div>
              <div className="flex gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-bold">{orderSuccess.shippingPhone}</span>
              </div>
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-700 font-bold">{orderSuccess.shippingAddress}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-bold text-sm">Tổng tiền</span>
                <span className="text-xl font-black text-blue-600">
                  {orderSuccess.totalAmount?.toLocaleString()}₫
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-slate-200 transition-all text-center italic"
              >
                Tiếp tục mua sắm
              </Link>
              <Link
                to="/profile"
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-center italic"
              >
                Xem đơn hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty Cart Guard ──────────────────────────────────────────────────────
  if (activeItems.length === 0) {
    return (
      <div className="flex-grow bg-slate-50 py-12">
        <div className="container-custom max-w-xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100">
            <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-3 italic uppercase">Giỏ hàng trống</h2>
            <p className="text-slate-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black italic uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ─────────────────────────────────────────────────────────
  return (
    <div className="flex-grow bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link to="/cart" className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Thanh toán
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Thông tin giao hàng
                </h2>

                {/* Shipping Name */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="shippingName"
                      value={form.shippingName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 focus:outline-none focus:bg-white transition-all ${
                        errors.shippingName
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.shippingName && (
                    <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.shippingName}</p>
                  )}
                </div>

                {/* Shipping Phone */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="shippingPhone"
                      value={form.shippingPhone}
                      onChange={handleChange}
                      placeholder="0901 234 567"
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 focus:outline-none focus:bg-white transition-all ${
                        errors.shippingPhone
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.shippingPhone && (
                    <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.shippingPhone}</p>
                  )}
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Địa chỉ giao hàng <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      name="shippingAddress"
                      value={form.shippingAddress}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className={`w-full pl-11 pr-4 py-4 bg-slate-50 border-2 rounded-2xl font-bold text-slate-800 focus:outline-none focus:bg-white transition-all resize-none ${
                        errors.shippingAddress
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-100 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.shippingAddress && (
                    <p className="mt-1.5 text-xs text-red-500 font-bold">{errors.shippingAddress}</p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Ghi chú thêm cho người giao hàng (không bắt buộc)"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Phương thức thanh toán <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${form.paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}>
                      <input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === 'COD'} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">Thanh toán khi nhận hàng (COD)</span>
                        <span className="text-xs font-medium text-slate-500">Trả tiền mặt khi giao hàng</span>
                      </div>
                    </label>

                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex items-center gap-3 transition-all ${form.paymentMethod === 'VNPAY' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200'}`}>
                      <input type="radio" name="paymentMethod" value="VNPAY" checked={form.paymentMethod === 'VNPAY'} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">Thanh toán VNPAY</span>
                        <span className="text-xs font-medium text-slate-500">Thẻ ATM, Visa, MasterCard</span>
                        {form.paymentMethod === 'VNPAY' && (
                          <span className="text-xs font-bold text-orange-500 mt-1">
                            Link thanh toán an toàn sẽ được gửi vào email của bạn
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg italic uppercase tracking-wider hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Xác nhận đặt hàng
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 italic uppercase tracking-tight mb-6">
                Đơn hàng ({activeItems.length} sản phẩm)
              </h3>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 mb-6">
                {activeItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl shrink-0 overflow-hidden border border-slate-100">
                      <img
                        src={getProductImageUrl(item.productThumbnail)}
                        alt={item.productName}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-slate-800 truncate">{item.productName}</h5>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        {item.quantity} x {item.price?.toLocaleString()}₫
                      </p>
                    </div>
                    <span className="text-sm font-black text-slate-800 shrink-0">
                      {(item.price * item.quantity)?.toLocaleString()}₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>Tạm tính</span>
                  <span>{cart.subtotal?.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-emerald-500">Miễn phí</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                  <span className="font-black text-slate-900 uppercase italic">Tổng tiền</span>
                  <span className="text-2xl font-black text-blue-600 tracking-tighter">
                    {cart.total?.toLocaleString()}₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
