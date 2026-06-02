'use client';

import { useAdmin } from "@/context/AdminContext";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function RevenueReport() {
  const { bookings } = useAdmin();

  // 1. Doanh thu thực tế (Đơn đã xác nhận hoặc hoàn thành)
  const actualRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // 2. Doanh thu dự kiến (Mới, xác nhận, hoàn thành - loại trừ hủy)
  const projectedRevenue = bookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // 3. Số đơn thành công/chờ chạy
  const successBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'completed'
  ).length;

  // 4. Doanh thu theo tuyến đường
  const routeRevenueMap: Record<string, number> = {};
  bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .forEach((b) => {
      routeRevenueMap[b.routeName] = (routeRevenueMap[b.routeName] || 0) + b.totalPrice;
    });

  const routeRevenues = Object.entries(routeRevenueMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-3xl bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans border-none space-y-6">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
        <div>
          <h3 className="text-base font-black text-[#102033]">Báo cáo doanh thu</h3>
          <p className="text-xs text-[#5f6b76] mt-0.5">Thống kê doanh số thực nhận và hiệu quả khai thác các tuyến.</p>
        </div>
        <span className="rounded-xl bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-700">
          Đơn đã xử lý: {successBookingsCount}
        </span>
      </div>

      {/* Grid thẻ doanh thu */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#fbfaf7] p-5 shadow-[0_4px_16px_rgba(16,32,51,0.01)] border-none">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu thực nhận</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatMoney(actualRevenue)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Từ các đơn đã xác nhận/hoàn thành</p>
        </div>

        <div className="rounded-2xl bg-[#fbfaf7] p-5 shadow-[0_4px_16px_rgba(16,32,51,0.01)] border-none">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu dự kiến</p>
          <p className="text-2xl font-black text-[#102033] mt-1">{formatMoney(projectedRevenue)}</p>
          <p className="text-[10px] text-slate-400 mt-1">Bao gồm cả các đơn mới đang chờ xử lý</p>
        </div>
      </div>

      {/* Thống kê chi tiết theo tuyến đường */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-[#102033] uppercase tracking-wider">
          Phân tích doanh thu theo Tuyến
        </h4>

        {routeRevenues.length > 0 ? (
          <div className="space-y-3">
            {routeRevenues.map((route) => {
              const percent = actualRevenue > 0 ? (route.amount / actualRevenue) * 100 : 0;
              return (
                <div key={route.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#102033] font-bold">{route.name}</span>
                    <span className="text-[#5f6b76]">
                      {formatMoney(route.amount)}{' '}
                      <span className="text-[#c88925] font-black">({percent.toFixed(0)}%)</span>
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#fbfaf7] h-2 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <div 
                      className="bg-[#c88925] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-slate-400 italic">
            Chưa có doanh thu nào được ghi nhận.
          </div>
        )}
      </div>
    </div>
  );
}
