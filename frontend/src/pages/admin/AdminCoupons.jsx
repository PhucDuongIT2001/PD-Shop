import React from 'react';

const AdminCoupons = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Mã Giảm Giá</h2>
          <p className="text-slate-500 font-medium">Quản lý các chương trình khuyến mãi.</p>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/20">Thêm mã giảm giá</button>
      </div>
      
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
        <h3 className="text-xl font-bold text-slate-400 italic">Tính năng đang được phát triển...</h3>
      </div>
    </div>
  );
};

export default AdminCoupons;
