import React, { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, Eye, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions(page);
  }, [page, statusFilter]);

  const fetchTransactions = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/payment/vnpay/admin/transactions?page=${pageNum}&size=10`);
      setTransactions(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.number + 1);
    } catch (err) {
      toast.error('Lỗi khi tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Thành Công
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black uppercase tracking-wider border border-red-100">
            <XCircle className="w-3.5 h-3.5" />
            Thất Bại
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider border border-amber-100">
            <AlertCircle className="w-3.5 h-3.5" />
            Chờ Xử Lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-xs font-black uppercase tracking-wider border border-slate-100">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const filteredTransactions = transactions.filter(tx => {
    const term = searchTerm.toLowerCase();
    const codeMatch = tx.transactionCode?.toLowerCase().includes(term);
    const vnpNoMatch = tx.vnpTransactionNo?.toLowerCase().includes(term);
    const userMatch = tx.user?.username?.toLowerCase().includes(term);
    const orderMatch = String(tx.order?.id).includes(term);
    
    const statusMatch = !statusFilter || tx.paymentStatus === statusFilter;
    
    return (codeMatch || vnpNoMatch || userMatch || orderMatch) && statusMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight">Đối Soát Giao Dịch</h1>
          <p className="text-blue-100 font-medium text-sm mt-1">Quản lý lịch sử thanh toán VNPay và COD toàn hệ thống PD-Shop</p>
        </div>
        <button 
          onClick={() => fetchTransactions(page)} 
          disabled={loading}
          className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl flex items-center gap-2 border border-white/10 font-bold transition-all text-sm outline-none"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã Giao Dịch, Đơn Hàng, Khách Hàng..."
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm"
          />
        </div>

        {/* Dropdown status */}
        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành Công</option>
            <option value="FAILED">Thất Bại</option>
            <option value="PENDING">Chờ xử lý</option>
          </select>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Đơn Hàng</th>
                <th className="px-6 py-5">Mã Giao Dịch (Local / VNPay)</th>
                <th className="px-6 py-5">Khách Hàng</th>
                <th className="px-6 py-5 text-right">Số Tiền</th>
                <th className="px-6 py-5">Ngân Hàng</th>
                <th className="px-6 py-5">Thời Gian</th>
                <th className="px-6 py-5">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang tải danh sách giao dịch...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-bold">
                    Không tìm thấy lịch sử giao dịch nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors text-sm font-bold text-slate-700">
                    <td className="px-6 py-5">
                      <span className="text-blue-600 font-black">#{tx.order?.id}</span>
                    </td>
                    <td className="px-6 py-5 flex flex-col gap-0.5 max-w-[200px] truncate">
                      <span className="text-slate-800 font-extrabold text-xs uppercase truncate" title={tx.transactionCode}>
                        {tx.transactionCode}
                      </span>
                      {tx.vnpTransactionNo && (
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                          VNP: {tx.vnpTransactionNo}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-black">{tx.user?.username}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{tx.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-blue-600">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-5 font-black text-slate-600">
                      {tx.bankCode || 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-400 font-bold">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(tx.paymentStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border-2 border-slate-100 rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border-2 border-slate-100 rounded-xl font-black text-xs uppercase hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
