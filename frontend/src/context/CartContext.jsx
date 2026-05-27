import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      return false;
    }

    try {
      setLoading(true);
      // POST /api/cart/items  body: { productId, quantity }
      const response = await api.post('/cart/items', { productId, quantity });
      setCart(response.data);
      toast.success('Đã thêm vào giỏ hàng!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thêm vào giỏ hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      // PUT /api/cart/items/{itemId}?quantity=N
      const response = await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
      setCart(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật số lượng');
    }
  };

  const removeItem = async (itemId) => {
    try {
      // DELETE /api/cart/items/{itemId}
      const response = await api.delete(`/cart/items/${itemId}`);
      setCart(response.data);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const toggleSaveForLater = async (itemId) => {
    try {
      // PATCH /api/cart/items/{itemId}/save-for-later
      const response = await api.patch(`/cart/items/${itemId}/save-for-later`);
      setCart(response.data);
    } catch (error) {
      toast.error('Lỗi thao tác');
    }
  };

  const cartItemCount = cart.items
    ? cart.items.filter(i => !i.saveForLater).length
    : 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartItemCount,
      addToCart,
      updateQuantity,
      removeItem,
      toggleSaveForLater,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
