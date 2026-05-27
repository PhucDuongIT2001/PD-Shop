import React, { useState, useEffect } from 'react';
import { products as defaultProducts } from '../../data/mockData';
import ProductCard from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductGrid = ({ title, category }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('mockProducts');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('mockProducts');
      if (saved) {
        setProducts(JSON.parse(saved));
      }
    };
    // Sync when component mounts (in case it wasn't unmounted by router)
    handleStorageChange();
    // Sync across tabs
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredProducts = category 
    ? products.filter(p => p.category === category)
    : products;

  return (
    <section className="py-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
            <span className="w-2 h-7 bg-red-600 rounded-full inline-block"></span>
            {title}
          </h2>
          <Link to="#" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
