import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout & Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Hero from './components/home/Hero';
import Categories from './components/home/Categories';
import Brands from './components/home/Brands';
import ProductGrid from './components/products/ProductGrid';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminArAssets from './pages/admin/AdminArAssets';
import CartPage from './pages/CartPage';
import ChatPage from './pages/ChatPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ARPlannerPage from './pages/ARPlannerPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import VNPayReturnPage from './pages/VNPayReturnPage';
import ConfirmOrderPage from './pages/ConfirmOrderPage';
import ProductsPage from './pages/ProductsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

// Mock Home Page Component
const Home = () => (
  <main className="flex-grow">
    <Hero />
    <Categories />
    <Brands />
    <div className="space-y-4">
      <ProductGrid title="Sản phẩm mới nhất" />
      <ProductGrid title="Gaming Laptops" category="Laptop" />
    </div>
  </main>
);


function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              fontWeight: '600',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
          }}
        />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Main Site Routes */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <Home />
              <Footer />
            </div>
          } />

          {/* Track Order */}
          <Route path="/track-order" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <OrderTrackingPage />
              <Footer />
            </div>
          } />

          {/* Product Detail */}
          {/* Products */}
          <Route path="/products" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <ProductsPage />
              <Footer />
            </div>
          } />
          
          <Route path="/product/:id" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <ProductDetailPage />
              <Footer />
            </div>
          } />

          {/* Cart */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <CartPage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />

          {/* Checkout */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <CheckoutPage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />
          
          {/* Confirm Order from Email */}
          <Route path="/confirm-order" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <ConfirmOrderPage />
              <Footer />
            </div>
          } />

          <Route path="/payment/vnpay/return" element={
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <VNPayReturnPage />
              <Footer />
            </div>
          } />

          {/* Orders */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <MyOrdersPage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <OrderDetailPage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />

          {/* Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <ProfilePage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <ChatPage />
                <Footer />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/ar-planner" element={
            <ProtectedRoute>
              <ARPlannerPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="ar-assets" element={<AdminArAssets />} />
          </Route>

          {/* Protected Staff Routes */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF']}>
              <div className="min-h-screen flex items-center justify-center">Staff Portal</div>
            </ProtectedRoute>
          } />

          {/* Fallback 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <h1 className="text-9xl font-black text-slate-200">404</h1>
              <p className="text-xl text-slate-600 mt-4">Trang bạn tìm kiếm không tồn tại.</p>
              <Link to="/" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                Quay lại Trang Chủ
              </Link>
            </div>
          } />
        </Routes>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
