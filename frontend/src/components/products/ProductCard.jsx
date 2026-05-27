import React, { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { getProductImageUrl } from '../../utils/imageUtils';
import { Button } from '../ui/Button';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product.id, 1);
    setIsAdding(false);
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  // Backend DTO uses `basePrice` as the original price before discount.
  // Legacy mock data may use `oldPrice` — support both.
  const originalPrice = product.basePrice || product.oldPrice || null;

  const formattedOriginalPrice =
    originalPrice
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)
      : null;

  // Compute discount % only when basePrice > price (i.e. there is an actual discount)
  const discountPercent =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/product/${product.id}`}
        className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden relative h-full"
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg shadow-red-600/20 italic">
            -{discountPercent}%
          </div>
        )}

        {/* Image Section */}
        <div className="relative w-full h-64 overflow-hidden bg-slate-50 border-b border-slate-50">
          <img
            src={getProductImageUrl(product.thumbnail || product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist Button */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand name */}
          {product.brandName && (
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
              {product.brandName}
            </span>
          )}

          <h3 className="text-slate-800 font-black text-sm mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors italic uppercase tracking-tighter">
            {product.name}
          </h3>

          <div className="mt-auto">
            <div className="flex flex-col gap-0.5 mb-4">
              <span className="text-red-600 font-black text-lg leading-none">{formattedPrice}</span>
              {formattedOriginalPrice && originalPrice > product.price && (
                <span className="text-slate-400 line-through text-[11px] font-bold">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              isLoading={isAdding}
              className="w-full bg-slate-900 text-white hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-600/20 italic uppercase font-black text-xs"
            >
              {!isAdding && <ShoppingCart className="w-4 h-4 mr-2" />}
              {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
