'use client';

import { useState } from 'react';
import { useAdmin } from "@/context/AdminContext";
import StatusBadge from "@/components/common/StatusBadge";
import type { Booking, BookingStatus } from "@/lib/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function formatCreatedAt(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    if (isToday) return `Đặt lúc: ${timeStr} (Hôm nay)`;
    const dateFormatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    return `Đặt lúc: ${timeStr} (${dateFormatted})`;
  } catch {
    return '';
  }
}

export default function TodayBookings() {
  const {
    bookings,
    updateBookingStatus,
    updateBookingInternalNote,
    updateBookingTravelTime,
    bookingHistory
  } = useAdmin();

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [modalTravelTime, setModalTravelTime] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<BookingStatus | null>(null);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const todayBookings = bookings
    .filter((b) => {
      if (!b.createdAt) return false;
      try {
        const createdDate = new Date(b.createdAt);
        return (
          createdDate.getFullYear() === today.getFullYear() &&
          createdDate.getMonth() === today.getMonth() &&
          createdDate.getDate() === today.getDate()
        );
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      // Newest first
      const dateA = a.createdAt || '';
      const dateB = b.createdAt || '';
      return dateB.localeCompare(dateA);
    });

  const handleOpenDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setInternalNoteInput(booking.internalNote || '');
    setModalTravelTime(booking.travelTime || '');
    setStatusChangeNote('');
    setIsUpdatingStatus(null);
  };

  const handleSaveInternalNote = () => {
    if (!selectedBooking) return;
    updateBookingInternalNote(selectedBooking.id, internalNoteInput);
    setSelectedBooking({ ...selectedBooking, internalNote: internalNoteInput });
    alert('Đã lưu ghi chú nội bộ thành công!');
  };

  const handleUpdateStatus = (status: BookingStatus) => {
    if (!selectedBooking) return;
    updateBookingStatus(selectedBooking.id, status, statusChangeNote);
    setSelectedBooking(null);
    setStatusChangeNote('');
    setIsUpdatingStatus(null);
  };

  const activeHistory = selectedBooking
    ? bookingHistory.filter(h => h.bookingId === selectedBooking.id)
    : [];

  // Available next statuses based on current
  const getNextStatuses = (current: BookingStatus): { status: BookingStatus; label: string; style: string; icon: React.ReactNode }[] => {
    switch (current) {
      case 'new':
        return [
          {
            status: 'confirmed', label: 'Xác nhận đơn', style: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
          },
          {
            status: 'cancelled', label: 'Hủy đơn', style: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          },
        ];
      case 'confirmed':
        return [
          {
            status: 'completed', label: 'Hoàn thành', style: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          },
          {
            status: 'cancelled', label: 'Hủy đơn', style: 'bg-rose-100 text-rose-800 hover:bg-rose-200',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          },
        ];
      case 'completed':
        return [];
      default:
        return [];
    }
  };

  return (
    <div className="rounded-2xl bg-[#fffdf8] font-sans h-full flex flex-col border border-amber-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 border-b border-amber-100 min-h-[72px]">
        <div>
          <h2 className="text-base font-bold text-slate-900">Đơn hôm nay</h2>
          <p className="text-xs text-slate-500 mt-0.5">Nhấn vào đơn để xem chi tiết và xử lý.</p>
        </div>
        <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700">
          {todayBookings.length} đơn
        </span>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[520px]">
        {todayBookings.length > 0 ? (
          <table className="w-full text-sm min-w-[600px] sm:min-w-full">
            <thead>
              <tr className="bg-[#123047] text-white text-[11px] font-semibold uppercase tracking-wider">
                <th className="text-left pl-6 pr-3 py-3.5">Đặt lúc</th>
                <th className="text-left px-3 py-3.5">Khách hàng</th>
                <th className="text-left px-3 py-3.5 hidden sm:table-cell">Tuyến</th>
                <th className="text-left px-3 py-3.5">Khởi hành</th>
                <th className="text-center px-3 py-3.5 hidden md:table-cell">Số khách</th>
                <th className="text-right px-3 py-3.5">Giá</th>
                <th className="text-center pl-3 pr-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((booking) => {
                const isNew = booking.status === 'new';
                return (
                  <tr
                    key={booking.id}
                    onClick={() => handleOpenDetail(booking)}
                    className={`border-b border-amber-50 transition duration-150 hover:bg-slate-50 cursor-pointer group ${
                      isNew ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Đặt lúc */}
                    <td className="pl-6 pr-3 py-3.5">
                      <div className="inline-flex items-center gap-1.5">
                        {isNew && (
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                        {booking.createdAt ? (
                          <span className="text-[11px] text-slate-600 font-semibold">
                            {new Date(booking.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            <span className="text-[10px] text-slate-400 ml-1">
                              {new Date(booking.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">—</span>
                        )}
                      </div>
                    </td>

                    {/* Khách hàng */}
                    <td className="py-3.5 pr-2">
                      <p className="font-semibold text-slate-900 text-[13px] leading-tight group-hover:text-[#c88925] transition">{booking.customerName}</p>
                      <span className="text-[11px] text-[#c88925] font-bold flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {booking.phone}
                      </span>
                    </td>

                    {/* Tuyến */}
                    <td className="py-3.5 pr-2 hidden sm:table-cell">
                      <span className="text-slate-900 font-bold text-xs">{booking.routeName}</span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px] mt-0.5" title={booking.pickupAddress}>
                        Đón: {booking.pickupAddress}
                      </p>
                    </td>

                    {/* Khởi hành (ngày + giờ đi) */}
                    <td className="py-3.5 pr-2">
                      <div className="inline-flex items-center gap-1.5">
                        {booking.travelTime && (
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md text-xs font-black">
                            {booking.travelTime}
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900">
                          {booking.travelDate.split('-').reverse().slice(0, 2).join('/')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2 text-center hidden md:table-cell">
                      <span className="bg-slate-100 text-slate-900 font-bold text-xs px-2 py-1 rounded-lg">
                        {booking.passengerCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span className="text-emerald-600 font-extrabold text-[13px]">
                        {formatMoney(booking.totalPrice)}
                      </span>
                    </td>

                    <td className="py-3.5 pl-3 pr-6 text-center">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-sm text-slate-600 font-bold italic">
            Không có đơn nào trong hôm nay.
          </div>
        )}
      </div>

      {/* ===== BOOKING DETAIL MODAL — Modern redesign ===== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 font-sans backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* ─── HEADER ─── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-400">{selectedBooking.code}</span>
                {selectedBooking.createdAt && (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {formatCreatedAt(selectedBooking.createdAt)}
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedBooking(null)} className="rounded-xl p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ─── HERO INFO STRIP ─── */}
            <div className="px-5 py-4 bg-[#04101b] text-white shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold leading-tight">{selectedBooking.customerName}</h3>
                  <a href={`tel:${selectedBooking.phone}`} className="text-amber-400 font-semibold text-sm mt-0.5 inline-flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {selectedBooking.phone}
                  </a>
                  {selectedBooking.customerEmail && (
                    <p className="text-slate-400 text-xs mt-0.5">{selectedBooking.customerEmail}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tổng tiền</p>
                  <p className="text-2xl font-black text-amber-400 leading-tight">{formatMoney(selectedBooking.totalPrice)}</p>
                  <div className="mt-1"><StatusBadge status={selectedBooking.status} /></div>
                </div>
              </div>

              {/* Route + Date row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                <span className="flex items-center gap-1.5 text-white font-semibold">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f8c95c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/>
                    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>
                  </svg>
                  {selectedBooking.routeName}
                </span>
                <span className="flex items-center gap-1 text-slate-300 text-xs">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {selectedBooking.travelDate}
                  {selectedBooking.travelTime && (
                    <span className="ml-1 bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold text-[10px]">{selectedBooking.travelTime}</span>
                  )}
                </span>
                <span className="text-slate-400 text-xs">{selectedBooking.passengerCount} hành khách</span>
              </div>

              {/* Pickup / Dropoff compact */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div className="bg-white/8 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-amber-400 uppercase tracking-wider font-bold mb-0.5">Điểm đón</p>
                  <p className="text-xs text-white font-medium leading-snug">{selectedBooking.pickupAddress}</p>
                </div>
                <div className="bg-white/8 rounded-xl px-3 py-2">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Điểm trả</p>
                  <p className="text-xs text-white font-medium leading-snug">{selectedBooking.dropoffAddress}</p>
                </div>
              </div>
            </div>

            {/* ─── BODY scrollable ─── */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">

              {/* STATUS ACTIONS — prominent */}
              {getNextStatuses(selectedBooking.status).length > 0 && (
                <div className="px-5 py-4 bg-amber-50/50">
                  {isUpdatingStatus ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-700">
                        Chuyển sang <span className="text-amber-600 font-bold">
                          {isUpdatingStatus === 'confirmed' ? 'Đã xác nhận' : isUpdatingStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </p>
                      <textarea
                        rows={2}
                        value={statusChangeNote}
                        onChange={(e) => setStatusChangeNote(e.target.value)}
                        placeholder="Ghi chú đi kèm (không bắt buộc)..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus(isUpdatingStatus)}
                          className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2.5 transition">
                          Xác nhận chuyển
                        </button>
                        <button onClick={() => setIsUpdatingStatus(null)}
                          className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-5 py-2.5 transition">
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500 mr-1">Chuyển trạng thái:</span>
                      {getNextStatuses(selectedBooking.status).map((action) => (
                        <button key={action.status} onClick={() => setIsUpdatingStatus(action.status)}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 border ${action.style}`}>
                          {action.icon}{action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* UPDATE GIỜ ĐI */}
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giờ khởi hành</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedBooking.travelTime || <span className="text-slate-400 font-normal italic">Chưa xác định</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input type="time" value={modalTravelTime} onChange={(e) => setModalTravelTime(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 text-slate-900 px-3 py-1.5 text-sm outline-none focus:border-amber-400 font-sans"/>
                  <button type="button" onClick={async () => {
                    await updateBookingTravelTime(selectedBooking.id, modalTravelTime);
                    setSelectedBooking({ ...selectedBooking, travelTime: modalTravelTime });
                  }} className="rounded-lg bg-[#0d1a28] hover:bg-[#04101b] px-3 py-1.5 text-xs font-semibold text-white transition">
                    Lưu
                  </button>
                </div>
              </div>

              {/* NOTES */}
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ghi chú khách hàng</p>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-600 min-h-[60px]">
                    {selectedBooking.customerNote || <span className="italic text-slate-400">Không có ghi chú</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ghi chú nội bộ</p>
                  <textarea rows={3} value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Chỉ nhân viên xem được..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 resize-none"/>
                  <button onClick={handleSaveInternalNote}
                    className="mt-2 rounded-lg bg-[#0d1a28] hover:bg-[#04101b] px-4 py-1.5 text-xs font-semibold text-white transition">
                    Lưu ghi chú
                  </button>
                </div>
              </div>

              {/* HISTORY */}
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lịch sử xử lý</p>
                {activeHistory.length > 0 ? (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                    {activeHistory.map((log) => (
                      <div key={log.id} className="flex gap-3 text-xs">
                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                        <div>
                          <span className="text-slate-400">{new Date(log.changedAt).toLocaleString('vi-VN')}</span>
                          <span className="text-slate-500 mx-1">·</span>
                          <span className="font-semibold text-slate-700">{log.changedBy}</span>
                          <p className="text-slate-600 mt-0.5">
                            {log.oldStatus} → <span className="font-semibold text-slate-800">{log.newStatus}</span>
                          </p>
                          {log.note && <p className="text-slate-500 italic mt-0.5">"{log.note}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa có lịch sử.</p>
                )}
              </div>
            </div>

            {/* ─── FOOTER ─── */}
            <div className="shrink-0 border-t border-slate-100 px-5 py-3 flex justify-end bg-white">
              <button onClick={() => setSelectedBooking(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
