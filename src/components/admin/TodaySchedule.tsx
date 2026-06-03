'use client';

import { useAdmin } from "@/context/AdminContext";
import StatusBadge from "@/components/common/StatusBadge";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function TodaySchedule() {
  const { bookings } = useAdmin();

  // Helper to get local date in YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());

  // Filter for today's active trips, sorted chronologically by departure time
  const todayTrips = bookings
    .filter((b) => b.travelDate === todayStr && b.status !== 'cancelled')
    .sort((a, b) => {
      const timeA = a.travelTime || '00:00';
      const timeB = b.travelTime || '00:00';
      return timeA.localeCompare(timeB);
    });

  return (
    <div className="rounded-3xl bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans h-full flex flex-col border-none">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
        <div>
          <h3 className="text-base font-black text-[#102033]">Lịch chuyến hôm nay</h3>
          <p className="text-xs text-[#5f6b76] mt-0.5">Danh sách các cuốc xe chạy trong ngày.</p>
        </div>
        <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-700">
          {todayTrips.length} chuyến
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-3.5 overflow-y-auto max-h-[500px] pr-1">
        {todayTrips.length > 0 ? (
          todayTrips.map((trip) => {
            const isNew = trip.status === 'new';
            return (
              <div 
                key={trip.id} 
                className={`rounded-2xl p-4 transition duration-200 shadow-[0_4px_16px_rgba(16,32,51,0.02)] border-none ${
                  isNew 
                    ? 'bg-amber-500/5' 
                    : 'bg-[#fbfaf7] hover:bg-[#f6efe1]/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {trip.travelTime && (
                        <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[10px] font-black shrink-0">
                          {trip.travelTime}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[#102033] mt-0.5 text-sm">{trip.customerName}</h4>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>

                <div className="mt-3 space-y-2 text-xs text-[#5f6b76]">
                  <p className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Tuyến:</span> 
                    <span className="text-[#102033] font-bold">{trip.routeName}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">Số khách:</span> 
                    <span className="text-[#c88925] font-black">{trip.passengerCount} người</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-slate-800 shrink-0">Đón:</span> 
                    <span className="text-slate-700">{trip.pickupAddress}</span>
                  </p>
                  <p className="flex items-start gap-1">
                    <span className="font-semibold text-slate-800 shrink-0">Trả:</span> 
                    <span className="text-slate-700">{trip.dropoffAddress}</span>
                  </p>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#e8dccb]/20 flex items-center justify-end">
                  <a 
                    href={`tel:${trip.phone}`} 
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[11px] font-bold transition flex items-center gap-1 border-none shadow-[0_2px_6px_rgba(16,185,129,0.2)]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Gọi điện
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-slate-400 italic">
            Không có chuyến đi nào được đặt trong hôm nay.
          </div>
        )}
      </div>
    </div>
  );
}
