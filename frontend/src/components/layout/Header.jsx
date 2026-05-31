import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Phone, MapPin, LogOut, Settings, LayoutDashboard, ShoppingBag, Trash2, Box } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImageUrl } from '../../utils/imageUtils';
import NotificationDropdown from '../admin/NotificationDropdown';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { user, logout } = useAuth();
  const { cart, removeItem } = useCart();
  const navigate = useNavigate();

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (keyword.trim().length > 0) {
        setIsSearching(true);
        try {
          // Import API dynamically or use it directly if imported at top
          import('../../api/axios').then(async (module) => {
            const api = module.default;
            try {
              const res = await api.get(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
              let results = res.data.content || res.data || [];
              
              try {
                const mockStr = localStorage.getItem('mockProducts');
                if (mockStr) {
                  const mocks = JSON.parse(mockStr);
                  const newMocks = mocks.filter(p => p.id > 10 || p.id < 0);
                  const filteredMocks = newMocks.filter(p => p.name.toLowerCase().includes(keyword.trim().toLowerCase()));
                  results = [...filteredMocks, ...results];
                }
              } catch (e) {}
              
              setSearchResults(results);
            } catch (err) {
              // fallback to only mock data
              try {
                const mockStr = localStorage.getItem('mockProducts');
                if (mockStr) {
                  const mocks = JSON.parse(mockStr);
                  const filtered = mocks.filter(p => p.name.toLowerCase().includes(keyword.trim().toLowerCase()));
                  setSearchResults(filtered);
                }
              } catch (e) {}
            }
          });
        } catch (error) {
          console.error("Lỗi khi tìm kiếm:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      setIsSearchFocused(false);
      navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchFilters();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFilters = async () => {
    try {
      // For Header, we can fetch from a global state/context if available, 
      // but for simplicity we fetch here. In a real app, use React Query or Redux.
      import('../../api/axios').then(module => {
        const api = module.default;
        Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]).then(([categoriesRes, brandsRes]) => {
          setCategories(categoriesRes.data || []);
          setBrands(brandsRes.data || []);
        });
      });
    } catch (error) {
      console.error('Lỗi khi tải danh mục/thương hiệu:', error);
    }
  };

  const getLinkForItem = (item) => {
    if (item === 'Sản phẩm mới') return '/products?isNew=true';
    if (item === 'Khuyến mãi') return '/products';
    
    // Check if it's a category
    const category = categories.find(c => c.name.toLowerCase() === item.toLowerCase());
    if (category) return `/products?categoryId=${category.id}`;
    
    // Check if it's a brand
    const brand = brands.find(b => b.name.toLowerCase() === item.toLowerCase());
    if (brand) return `/products?brandId=${brand.id}`;
    
    // Fallback to keyword
    return `/products?keyword=${encodeURIComponent(item)}`;
  };

  const handleLogout = () => {
    logout(); // AuthContext.logout() already navigates to /login
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN');

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-blue-700 text-white py-2 hidden lg:block">
        <div className="container-custom flex justify-between items-center text-xs font-medium">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Hotline: 1900 1234</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Hệ thống cửa hàng</span>
          </div>
          <div className="flex gap-6">
            <Link to="/chat" className="hover:underline">Hỏi đáp AI</Link>
            <Link to="/track-order" className="hover:underline">Tra cứu đơn hàng</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white border-b border-slate-100 py-4'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/20">
                PD
              </div>
              <span className="text-slate-900 font-black text-2xl tracking-tighter hidden sm:block italic">
                SHOP<span className="text-red-600">.</span>
              </span>
            </Link>

            {/* Search Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl px-12 relative">
              <form onSubmit={handleSearch} className="w-full relative group z-[100]">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-6 py-3.5 pr-12 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <Search className="w-5 h-5" />
                </button>

                {/* Search Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && keyword.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center text-slate-500 text-sm font-medium">Đang tìm kiếm...</div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {searchResults.map(product => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                <img src={getProductImageUrl(product.thumbnail || product.image)} alt={product.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-black text-red-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</span>
                                  {product.oldPrice && (
                                    <span className="text-[10px] text-slate-400 line-through">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.oldPrice)}</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                          <Link 
                            to={`/products?keyword=${encodeURIComponent(keyword.trim())}`}
                            className="block w-full text-center py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors bg-slate-50"
                          >
                            Xem tất cả kết quả
                          </Link>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm font-medium">Không tìm thấy sản phẩm nào</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-4">
              {/* Notifications */}
              {user && (
                <div className="flex flex-col items-center">
                  <NotificationDropdown />
                  <span className="text-[10px] font-bold mt-1 hidden sm:block uppercase">Thông báo</span>
                </div>
              )}

              {/* Account Menu */}
              <div className="relative">
                <button 
                  onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : navigate('/login')}
                  className="flex flex-col items-center p-2 text-slate-600 hover:text-blue-600 transition-colors group"
                >
                  <div className="relative">
                    <User className={`w-6 h-6 ${user ? 'text-blue-600' : ''}`} />
                  </div>
                  <span className="text-[10px] font-bold mt-1 hidden sm:block uppercase truncate max-w-[80px]">
                    {user ? user.username : 'Tài khoản'}
                  </span>
                </button>

                {/* User Dropdown */}
                {user && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Chào mừng,</p>
                      <p className="text-sm font-black text-slate-800 truncate">{user.username}</p>
                    </div>
                    
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold italic uppercase">
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold">
                      <User className="w-4 h-4" /> Thông tin cá nhân
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all font-bold">
                      <Settings className="w-4 h-4" /> Cài đặt
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all font-bold border-t border-slate-50 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              
              <div 
                className="relative"
                onMouseEnter={() => setIsCartOpen(true)}
                onMouseLeave={() => setIsCartOpen(false)}
              >
                <Link to="/cart" onClick={() => setIsCartOpen(false)} className="flex flex-col items-center p-2 text-slate-600 hover:text-blue-600 transition-colors group">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6" />
                    {cart.items.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white animate-bounce-subtle">
                        {cart.items.filter(i => !i.saveForLater).length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold mt-1 hidden sm:block uppercase">Giỏ hàng</span>
                </Link>

                {/* Mini Cart Dropdown */}
                <AnimatePresence>
                  {isCartOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-6 px-4 z-[110]"
                    >
                      <h4 className="text-sm font-black text-slate-900 uppercase italic mb-4 px-2">Giỏ hàng nhanh</h4>
                      
                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {cart.items.length === 0 ? (
                          <div className="py-8 text-center">
                            <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-bold">Giỏ hàng đang trống</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cart.items.filter(i => !i.saveForLater).map(item => (
                              <div key={item.id} className="flex gap-3 group/item">
                                <div className="w-16 h-16 bg-slate-50 rounded-xl shrink-0 overflow-hidden">
                                  <img src={getProductImageUrl(item.productThumbnail)} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 truncate group-hover/item:text-blue-600 transition-colors">{item.productName}</h5>
                                  <p className="text-[10px] text-slate-400 font-bold mb-1">{item.quantity} x {item.price.toLocaleString()}₫</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-slate-900">{(item.price * item.quantity).toLocaleString()}₫</span>
                                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {cart.items.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-50">
                          <div className="flex justify-between items-end mb-4 px-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Tổng tiền</span>
                            <span className="text-lg font-black text-blue-600">{cart.subtotal.toLocaleString()}₫</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link to="/cart" onClick={() => setIsCartOpen(false)} className="py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase text-center hover:bg-slate-200 transition-all">
                              Xem giỏ hàng
                            </Link>
                            <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase text-center shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                              Thanh toán
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[60px] bg-white z-[60] p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-right duration-300">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-slate-100 rounded-lg py-3 px-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <nav className="flex flex-col gap-2">
              {['Điện thoại', 'Laptop', 'PC Gaming', 'Phụ kiện', 'Smartwatch'].map((item) => (
                <Link 
                  key={item} 
                  to={getLinkForItem(item)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 px-4 bg-slate-50 rounded-lg font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all italic uppercase"
                >
                  {item}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin/dashboard" className="py-3 px-4 bg-blue-50 text-blue-700 rounded-lg font-black italic uppercase">
                  Quản trị hệ thống
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Sub Navbar - Desktop */}
      <nav className="bg-white border-b border-slate-100 hidden md:block">
        <div className="container-custom">
          <ul className="flex items-center gap-8 py-3 overflow-x-auto no-scrollbar">
            {['Sản phẩm mới', 'Điện thoại', 'Laptop', 'PC Gaming', 'Phụ kiện', 'Apple', 'Smartwatch', 'Khuyến mãi'].map((item) => (
              <li key={item}>
                <Link 
                  to={getLinkForItem(item)}
                  className="text-sm font-bold text-slate-700 hover:text-blue-600 whitespace-nowrap transition-colors uppercase tracking-tight italic"
                >
                  {item}
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <Link
                to="/ar-planner"
                className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 whitespace-nowrap transition-all uppercase tracking-tight italic bg-blue-50 px-4 py-1.5 rounded-full border border-blue-200 shadow-sm"
              >
                <Box className="w-4 h-4" />
                Thiết kế phòng AR
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Header;
