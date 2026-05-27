import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, PackageX, ArrowLeft, FilterX } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/products/ProductCard';
import { getProductImageUrl } from '../utils/imageUtils';
import { ProductSkeleton } from '../components/ui/Skeleton';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')) : null
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get('brandId') ? parseInt(searchParams.get('brandId')) : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Autocomplete states
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Derived: are any filters active?
  const hasActiveFilters =
    !!searchParams.get('keyword') ||
    !!searchParams.get('categoryId') ||
    !!searchParams.get('brandId') ||
    searchParams.get('isNew') === 'true';

  // ── Fetch filters (categories + brands) ──────────────────────
  const fetchFilters = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
      ]);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (err) {
      console.error('Lỗi khi tải bộ lọc:', err);
    }
  }, []);

  // ── Fetch products — receives explicit page + searchParams ────
  const fetchProducts = useCallback(async (currentPage, params) => {
    setLoading(true);
    setError(null);
    try {
      const currentKeyword = params.get('keyword') || '';
      const currentCategory = params.get('categoryId') || '';
      const currentBrand = params.get('brandId') || '';
      const isNew = params.get('isNew') === 'true';

      let url = `/products?page=${currentPage}&size=12`;
      if (currentKeyword) url += `&keyword=${encodeURIComponent(currentKeyword)}`;
      if (currentCategory) url += `&categoryId=${currentCategory}`;
      if (currentBrand) url += `&brandId=${currentBrand}`;
      if (isNew) url += `&isNew=true`;

      console.debug('[ProductsPage] fetchProducts URL:', url);

      const response = await api.get(url);
      const data = response.data;

      console.debug('[ProductsPage] API response:', {
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        contentLength: data.content?.length,
      });

      let dbProducts = data.content || [];

      setProducts(dbProducts);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounced autocomplete search ────────────────────────────
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (keyword.trim().length > 0 && isSearchFocused) {
        setIsSearching(true);
        try {
          const res = await api.get(
            `/products?keyword=${encodeURIComponent(keyword.trim())}&page=1&size=8`
          );
          setSearchResults(res.data.content || []);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword, isSearchFocused]);

  // ── Load filters once on mount ────────────────────────────────
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // ── Sync local state when URL params change ───────────────────
  useEffect(() => {
    const urlKeyword = searchParams.get('keyword') || '';
    const urlCategoryId = searchParams.get('categoryId');
    const urlBrandId = searchParams.get('brandId');

    setKeyword(urlKeyword);
    setSelectedCategory(urlCategoryId ? parseInt(urlCategoryId) : null);
    setSelectedBrand(urlBrandId ? parseInt(urlBrandId) : null);
  }, [searchParams]);

  // ── Fetch products whenever page or searchParams change ───────
  useEffect(() => {
    fetchProducts(page, searchParams);
  }, [page, searchParams, fetchProducts]);

  // ── Helpers ───────────────────────────────────────────────────
  const updateSearchParams = useCallback(
    (params) => {
      const newParams = {};
      if (params.keyword && params.keyword.trim()) newParams.keyword = params.keyword.trim();
      if (params.categoryId) newParams.categoryId = String(params.categoryId);
      if (params.brandId) newParams.brandId = String(params.brandId);
      if (searchParams.get('isNew') === 'true') newParams.isNew = 'true';
      setSearchParams(newParams);
      setPage(1);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchFocused(false);
    updateSearchParams({ keyword, categoryId: selectedCategory, brandId: selectedBrand });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchParams({});
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Sản Phẩm
          </h1>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 z-50">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-full font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isSearchFocused && keyword.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100]"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-500 text-sm font-medium">
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={getProductImageUrl(product.thumbnail)}
                              alt={product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate">
                              {product.name}
                            </h4>
                            <span className="text-xs font-black text-red-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(product.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm font-medium">
                      Không tìm thấy sản phẩm nào
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar Filter ── */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-slate-800 uppercase italic">Bộ Lọc</h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                    title="Xóa tất cả bộ lọc"
                  >
                    <FilterX className="w-4 h-4" />
                    Xóa lọc
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category filter */}
                <div>
                  <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">
                    Danh mục
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === null}
                        onChange={() => {
                          setSelectedCategory(null);
                          updateSearchParams({ keyword, categoryId: null, brandId: selectedBrand });
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">
                        Tất cả
                      </span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.id}
                          onChange={() => {
                            setSelectedCategory(cat.id);
                            updateSearchParams({ keyword, categoryId: cat.id, brandId: selectedBrand });
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brand filter */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">
                    Thương hiệu
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === null}
                        onChange={() => {
                          setSelectedBrand(null);
                          updateSearchParams({ keyword, categoryId: selectedCategory, brandId: null });
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">
                        Tất cả
                      </span>
                    </label>
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand.id}
                          onChange={() => {
                            setSelectedBrand(brand.id);
                            updateSearchParams({
                              keyword,
                              categoryId: selectedCategory,
                              brandId: brand.id,
                            });
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="text-slate-600 font-medium group-hover:text-blue-600 transition-colors">
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Grid ── */}
          <div className="w-full lg:w-3/4">
            {/* Result count */}
            {!loading && !error && products.length > 0 && (
              <p className="text-sm text-slate-500 mb-4 font-medium">
                Tìm thấy <span className="font-bold text-slate-700">{totalElements}</span> sản phẩm
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              /* ── Error state ── */
              <div className="bg-white rounded-3xl p-12 text-center border border-red-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PackageX className="w-10 h-10 text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button
                  onClick={() => fetchProducts(page, searchParams)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : products.length === 0 ? (
              /* ── Empty state ── */
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 mb-8">
                  {hasActiveFilters
                    ? 'Không có sản phẩm nào khớp với bộ lọc hiện tại. Hãy thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác.'
                    : 'Hiện chưa có sản phẩm nào. Vui lòng quay lại sau.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                    >
                      <FilterX className="w-4 h-4" />
                      Xóa bộ lọc
                    </button>
                  )}
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại trang sản phẩm
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${
                          page === i + 1
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="p-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
