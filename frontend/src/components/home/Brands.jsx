import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brands');
        setBrands(res.data || []);
      } catch (err) {
        console.error('Error fetching active brands', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="py-8 bg-slate-50 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (brands.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50/50 border-y border-slate-100/50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
              Hãng Đối Tác Tin Cậy
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sản phẩm chính hãng 100% bảo hành uy tín</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Tất cả sản phẩm <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link 
              key={brand.id}
              to={`/products?brandId=${brand.id}`}
              className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-2xl hover:border-blue-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Glassmorphic Background Glow */}
              <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="w-20 h-12 flex items-center justify-center overflow-hidden mb-3">
                {brand.image ? (
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm uppercase italic tracking-tighter">
                    {brand.name.substring(0, 2)}
                  </div>
                )}
              </div>

              <span className="text-slate-800 font-black text-xs uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;
