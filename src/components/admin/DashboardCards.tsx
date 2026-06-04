'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/bookings/actions';

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

type GrowthBadgeProps = { pct: number; label: string };
function GrowthBadge({ pct, label }: GrowthBadgeProps) {
  const isUp = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md mt-2 ${
      isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
    }`}>
      <span>{isUp ? '↑' : '↓'} {Math.abs(pct).toFixed(0)}%</span>
      <span className="text-slate-400 font-normal">{label}</span>
    </span>
  );
}

type CardProps = {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  iconBg: string;
  growth?: { pct: number; label: string };
  badge?: React.ReactNode;
};

function StatCard({ label, value, note, icon, iconBg, growth, badge }: CardProps) {
  return (
    <div className="relative h-full">
      {/* Mobile: text-only, minimal */}
      <div className="sm:hidden flex items-center gap-3 py-2">
        <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide leading-none">{label}</p>
          <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5 truncate">{value}</p>
          {growth && <GrowthBadge pct={growth.pct} label={growth.label} />}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Tablet+: full card */}
      <div className="hidden sm:block relative bg-[#fffdf8] rounded-2xl border border-amber-100 p-5 hover:shadow-md hover:border-amber-200 transition-all duration-200 h-full flex flex-col">
        {badge}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="mt-2.5 text-3xl font-bold text-slate-900 leading-none truncate">{value}</p>
              <p className="mt-1.5 text-xs text-slate-400">{note}</p>
              {growth && <GrowthBadge pct={growth.pct} label={growth.label} />}
            </div>
            <div className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${iconBg}`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCards() {
  const now = new Date();
  const [stats, setStats] = useState({
    todayCount: 0, pendingCount: 0, monthlyCount: 0, monthlyRevenue: 0,
    yesterdayCount: 0, lastMonthCount: 0, lastMonthRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
    // Refresh mỗi 2 phút
    const timer = setInterval(() => {
      getDashboardStats().then(s => setStats(s)).catch(() => {});
    }, 120_000);
    return () => clearInterval(timer);
  }, []);

  const { todayCount, pendingCount, monthlyCount, monthlyRevenue,
          yesterdayCount, lastMonthCount, lastMonthRevenue } = stats;

  const dayGrowth = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : todayCount * 100;
  const monthGrowth = lastMonthCount > 0 ? ((monthlyCount - lastMonthCount) / lastMonthCount) * 100 : monthlyCount * 100;
  const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : monthlyRevenue * 100;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:items-stretch bg-white sm:bg-transparent rounded-2xl sm:rounded-none border border-amber-100 sm:border-0 p-4 sm:p-0">
      <StatCard
        label="Đơn hôm nay"
        value={String(todayCount).padStart(2, '0')}
        note="Tổng đơn đặt xe trong ngày"
        growth={{ pct: dayGrowth, label: "so với hôm qua" }}
        iconBg="bg-orange-50"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        }
      />

      <StatCard
        label="Đơn cần xử lý"
        value={String(pendingCount).padStart(2, '0')}
        note="Đơn mới chưa được xác nhận"
        iconBg="bg-amber-50"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
          </svg>
        }
        badge={pendingCount > 0 ? (
          <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
        ) : undefined}
      />

      <StatCard
        label={`Tổng đơn tháng ${now.getMonth() + 1}`}
        value={String(monthlyCount).padStart(2, '0')}
        note={`Tất cả đơn trong tháng ${now.getMonth() + 1}`}
        growth={{ pct: monthGrowth, label: "so với tháng trước" }}
        iconBg="bg-blue-50"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        }
      />

      <StatCard
        label={`Doanh thu tháng ${now.getMonth() + 1}`}
        value={loading ? '—' : formatMoney(monthlyRevenue)}
        note="Đơn đã xác nhận + hoàn thành"
        growth={{ pct: revenueGrowth, label: "so với tháng trước" }}
        iconBg="bg-emerald-50"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      />
    </div>
  );
}
