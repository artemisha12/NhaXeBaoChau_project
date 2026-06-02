'use client';

import { useAdmin } from "@/context/AdminContext";

export default function DashboardCards() {
  const { bookings, vehicles } = useAdmin();
  const now = new Date();

  // Helper to get local date in YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(now);

  // 1. Số xe đang hoạt động (vehicles with status 'active')
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;

  // 2. Đơn mới hôm nay (bookings created today)
  const newBookingsToday = bookings.filter((b) => 
    b.createdAt && b.createdAt.startsWith(todayStr)
  ).length;

  // 3. Đơn chờ xác nhận (total bookings with status 'new' across all days)
  const pendingConfirm = bookings.filter((b) => b.status === 'new').length;

  // 4. Chuyến đi hôm nay (bookings with travelDate today and status !== 'cancelled')
  const tripsToday = bookings.filter((b) => 
    b.travelDate === todayStr && b.status !== 'cancelled'
  ).length;

  // 5. Tổng đơn trong tháng (bookings with travelDate in the current month)
  const currentMonthStr = todayStr.slice(0, 7); // e.g. "2026-06"
  const totalMonth = bookings.filter((b) => 
    b.travelDate && b.travelDate.startsWith(currentMonthStr)
  ).length;

  const cards = [
    { 
      label: "Số xe có sẵn", 
      value: String(activeVehicles).padStart(2, '0'), 
      note: "Đội xe sẵn sàng phục vụ", 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c88925" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#fff8e8] border-none"
    },
    { 
      label: "Đơn mới hôm nay", 
      value: String(newBookingsToday).padStart(2, '0'), 
      note: "Đơn đặt trong ngày", 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#fff2ed] border-none"
    },
    { 
      label: "Đơn chờ xác nhận", 
      value: String(pendingConfirm).padStart(2, '0'), 
      note: "Tổng đơn chưa xử lý", 
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      ),
      bgClass: "bg-[#fffdf8] border-none",
      iconBg: "bg-[#f0fdf4] border-none"
    },
    { 
      label: "Chuyến đi hôm nay", 
      value: String(tripsToday).padStart(2, '0'), 
      note: "Lịch chạy trong ngày", 
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
      label: "Tổng đơn trong tháng", 
      value: String(totalMonth).padStart(2, '0'), 
      note: `Tổng số chuyến tháng ${now.getMonth() + 1}`, 
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
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 font-sans">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(16,32,51,0.06)] transition duration-200 ${card.bgClass}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#5f6b76]">{card.label}</p>
              <p className="mt-3 text-4xl font-black tracking-tight text-[#102033]">{card.value}</p>
              <p className="mt-2 text-xs font-semibold text-[#9c9287]">{card.note}</p>
            </div>
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${card.iconBg}`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
