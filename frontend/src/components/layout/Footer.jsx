import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-600/20">
                PD
              </div>
              <span className="text-white font-black text-xl tracking-tighter italic">
                SHOP<span className="text-red-600">.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              PD-Shop là hệ thống bán lẻ thiết bị công nghệ hàng đầu, chuyên cung cấp các sản phẩm Gaming Gear, Laptop, PC chính hãng.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <Link key={i} to="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-white font-black text-sm uppercase italic mb-6 tracking-wider">Chính sách</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {['Chính sách bảo hành', 'Chính sách vận chuyển', 'Chính sách thanh toán', 'Bảo mật thông tin'].map((item) => (
                <li key={item}><Link to="#" className="hover:text-blue-500 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-black text-sm uppercase italic mb-6 tracking-wider">Hỗ trợ khách hàng</h3>
            <ul className="flex flex-col gap-3 text-sm">
              {['Tra cứu đơn hàng', 'Hướng dẫn mua online', 'Góp ý, khiếu nại', 'Chính sách đổi trả'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Tra cứu đơn hàng' ? '/track-order' : '#'} className="hover:text-blue-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-black text-sm uppercase italic mb-6 tracking-wider">Liên hệ</h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span>123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span>1900 1234 (8:00 - 21:00)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span>contact@pdshop.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-widest italic">
          <p>© 2024 PD-SHOP. THIẾT KẾ BỞI ANTIGRAVITY.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white">Điều khoản</Link>
            <Link to="#" className="hover:text-white">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
