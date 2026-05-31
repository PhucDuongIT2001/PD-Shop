import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ProductGrid = ({ title, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch 20 latest products from the backend
        const res = await api.get('/products?page=1&size=20');
        setProducts(res.data.content || []);
      } catch (err) {
        console.error('Error fetching products for grid', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = category 
    ? products.filter(p => p.categoryName === category)
    : products;

  // Limit display to 4 products on home page
  const displayedProducts = filteredProducts.slice(0, 4);

  if (loading) {
    return (
      <div className="py-8 bg-slate-50 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (displayedProducts.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
            <span className="w-2 h-7 bg-red-600 rounded-full inline-block"></span>
            {title}
          </h2>
          {category ? (
            <Link to={`/products?categoryId=${displayedProducts[0]?.categoryId}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link to="/products" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
