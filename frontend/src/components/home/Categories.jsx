import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Monitor, Watch, Headphones, ChevronRight, Boxes } from 'lucide-react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

const iconMap = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  Monitor: Monitor,
  Watch: Watch,
  Headphones: Headphones,
  'Điện thoại': Smartphone,
  'dien-thoai': Smartphone,
  'laptop': Laptop,
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching active categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-white flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full inline-block"></span>
            Danh mục nổi bật
          </h2>
          <Link to="/products" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
            Xem thêm <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            // Find corresponding icon or fallback to Boxes
            const slug = cat.slug?.toLowerCase() || '';
            const Icon = iconMap[cat.icon] || iconMap[cat.name] || iconMap[slug] || Boxes;
            
            return (
              <Link 
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-500/20 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden text-slate-700 group-hover:scale-110 group-hover:text-blue-600 transition-all duration-300 border border-slate-100">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-8 h-8" />
                  )}
                </div>
                <span className="text-slate-800 font-black text-sm uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
