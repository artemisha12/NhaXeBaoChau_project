'use client';

import { useAdmin } from "@/context/AdminContext";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function renderGrowth(pct: number, label: string) {
  const isPositive = pct >= 0;
  const colorClass = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const arrow = isPositive ? '↑' : '↓';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-black ${colorClass} bg-black/[0.02] px-1.5 py-0.5 rounded-md mt-1.5`}>
      <span>{arrow} {Math.abs(pct).toFixed(0)}%</span>
      <span className="text-[#9c9287] font-semibold ml-0.5">{label}</span>
    </span>
  );
}

export default function DashboardCards() {
  const { bookings } = useAdmin();
  const now = new Date();

  // Helper to get local date in YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(now);
  const currentMonthStr = todayStr.slice(0, 7); // e.g. "2026-06"

  // Yesterday date calculation
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Last Month string calculation
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthMonth = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
  const lastMonthStr = `${lastMonthYear}-${lastMonthMonth}`; // e.g. "2026-05"

  // 1. Số đơn hôm nay (bookings created today)
  const todayBookings = bookings.filter((b) => {
    if (!b.createdAt) return false;
    try {
      const createdDate = new Date(b.createdAt);
      return (
        createdDate.getFullYear() === now.getFullYear() &&
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getDate() === now.getDate()
      );
    } catch {
      return false;
    }
  });
  const todayBookingsCount = todayBookings.length;
  
  // Yesterday's bookings count (created yesterday)
  const yesterdayBookingsCount = bookings.filter((b) => {
    if (!b.createdAt) return false;
    try {
      const createdDate = new Date(b.createdAt);
      return (
        createdDate.getFullYear() === yesterday.getFullYear() &&
        createdDate.getMonth() === yesterday.getMonth() &&
        createdDate.getDate() === yesterday.getDate()
      );
    } catch {
      return false;
    }
  }).length;

  const dayGrowth = yesterdayBookingsCount > 0 ? ((todayBookingsCount - yesterdayBookingsCount) / yesterdayBookingsCount) * 100 : todayBookingsCount * 100;

  // 2. Đơn cần xử lý (status = 'new')
  const pendingCount = bookings.filter((b) => b.status === 'new').length;

  // 3. Tổng đơn trong tháng
  const monthlyCount = bookings.filter((b) => 
    b.travelDate && b.travelDate.startsWith(currentMonthStr)
  ).length;

  // Last Month's bookings count
  const lastMonthCount = bookings.filter((b) => 
    b.travelDate && b.travelDate.startsWith(lastMonthStr)
  ).length;

  const monthGrowth = lastMonthCount > 0 ? ((monthlyCount - lastMonthCount) / lastMonthCount) * 100 : monthlyCount * 100;

  // 4. Doanh thu tháng (confirmed + completed in this month)
  const monthlyRevenue = bookings
    .filter((b) => 
      b.travelDate?.startsWith(currentMonthStr) &&
      (b.status === 'confirmed' || b.status === 'completed')
    )
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Last Month's revenue
  const lastMonthRevenue = bookings
    .filter((b) => 
      b.travelDate?.startsWith(lastMonthStr) &&
      (b.status === 'confirmed' || b.status === 'completed')
    )
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : monthlyRevenue * 100;

  const cards = [
    { 
      label: "Số đơn hôm nay", 
      value: String(todayBookingsCount).padStart(2, '0'), 
      note: "Tổng đơn đặt xe trong ngày", 
      growth: renderGrowth(dayGrowth, "so với hôm qua"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#fff2ed] border-none",
    },
    { 
      label: "Đơn cần xử lý", 
      value: String(pendingCount).padStart(2, '0'), 
      note: "Đơn mới chưa được xác nhận", 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#f0fdf4] border-none",
      highlight: pendingCount > 0,
    },
    { 
      label: "Tổng đơn trong tháng", 
      value: String(monthlyCount).padStart(2, '0'), 
      note: `Tất cả đơn tháng ${now.getMonth() + 1}`, 
      growth: renderGrowth(monthGrowth, "so với tháng trước"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01" />
          <path d="M12 14h.01" />
          <path d="M16 14h.01" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#eff6ff] border-none"
    },
    { 
      label: "Doanh thu tháng", 
      value: formatMoney(monthlyRevenue), 
      note: `Doanh thu thực nhận tháng ${now.getMonth() + 1}`, 
      growth: renderGrowth(revenueGrowth, "so với tháng trước"),
      isRevenue: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#fef9c3] border-none"
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 font-sans">
      {cards.map((card) => (
        <div 
          key={card.label} 
          className={`relative rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(16,32,51,0.06)] transition duration-200 ${card.bgClass} ${
            (card as any).highlight ? 'ring-2 ring-amber-400/30' : ''
          }`}
        >
          {(card as any).highlight && (
            <div className="absolute top-3 right-3">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
          )}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#5f6b76]">{card.label}</p>
              <p className={`mt-3 font-black tracking-tight text-[#102033] ${
                (card as any).isRevenue ? 'text-2xl' : 'text-4xl'
              }`}>
                {card.value}
              </p>
              <p className="mt-2 text-xs font-semibold text-[#9c9287]">{card.note}</p>
              {(card as any).growth && <div className="mt-1">{(card as any).growth}</div>}
            </div>
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.iconBg}`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
