'use client';

import { useAdmin } from "@/context/AdminContext";
import type { BookingStatus } from "@/lib/types";

const STATUS_CONFIG: Record<BookingStatus, { accent: string; bg: string; badge: string; badgeText: string }> = {
  new:       { accent: 'border-amber-400',   bg: 'bg-amber-50/60',   badge: 'bg-amber-100 text-amber-700',   badgeText: 'Mới gửi'     },
  confirmed: { accent: 'border-emerald-400', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700', badgeText: 'Đã xác nhận' },
  completed: { accent: 'border-blue-300',    bg: 'bg-blue-50/30',    badge: 'bg-blue-100 text-blue-600',     badgeText: 'Hoàn thành'  },
  cancelled: { accent: 'border-slate-300',   bg: 'bg-slate-50/60',   badge: 'bg-slate-100 text-slate-500',   badgeText: 'Đã hủy'      },
};

export default function TodaySchedule() {
  const { bookings } = useAdmin();

  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getLocalDateString(new Date());

  const todayTrips = bookings
    .filter((b) => b.travelDate === todayStr && b.status !== 'cancelled')
    .sort((a, b) => (a.travelTime || '00:00').localeCompare(b.travelTime || '00:00'));

  return (
    <div className="bg-[#fffdf8] rounded-2xl border border-amber-100 h-full flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 border-b border-amber-100 min-h-[72px]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Lịch chuyến hôm nay</h3>
          <p className="text-xs text-slate-400 mt-0.5">Các cuốc xe trong ngày</p>
        </div>
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
          {todayTrips.length} chuyến
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto max-h-[520px] px-4 py-3 space-y-2.5">
        {todayTrips.length > 0 ? todayTrips.map((trip) => {
          const cfg = STATUS_CONFIG[trip.status as BookingStatus] ?? STATUS_CONFIG.new;
          return (
            <div
              key={trip.id}
              className={`rounded-xl border-l-[3px] px-4 py-3.5 ${cfg.accent} ${cfg.bg} border border-l-[3px] border-transparent`}
              style={{ borderLeftWidth: '3px' }}
            >
              {/* Row 1: time + status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 tabular-nums">
                  {trip.travelTime || '—:——'}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.badgeText}
                </span>
              </div>

              {/* Row 2: name + route */}
              <p className="text-sm font-semibold text-slate-900 leading-snug">{trip.customerName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{trip.routeName}</p>

              {/* Row 3: pickup / dropoff */}
              <div className="mt-2 space-y-0.5">
                <div className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="leading-snug">{trip.pickupAddress}</span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-400">
                  <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="leading-snug">{trip.dropoffAddress}</span>
                </div>
              </div>

              {/* Row 4: passengers + call */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/60">
                <span className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{trip.passengerCount}</span> khách
                </span>
                <a
                  href={`tel:${trip.phone}`}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-white/80 hover:bg-white border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {trip.phone}
                </a>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400">Không có chuyến nào hôm nay</p>
          </div>
        )}
      </div>
    </div>
  );
}
