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
    <div className="rounded-3xl bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans h-full flex flex-col border-none">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
        <div>
          <h2 className="text-base font-black text-[#102033]">Đơn hôm nay</h2>
          <p className="text-xs text-[#5f6b76] mt-0.5">Nhấn vào đơn để xem chi tiết và xử lý.</p>
        </div>
        <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-700">
          {todayBookings.length} đơn
        </span>
      </div>

      <div className="mt-4 flex-1 overflow-x-auto overflow-y-auto max-h-[520px] pr-1">
        {todayBookings.length > 0 ? (
          <table className="w-full text-sm min-w-[600px] sm:min-w-full">
            <thead>
              <tr className="text-[10px] font-bold text-[#9c9287] uppercase tracking-wider border-b border-[#e8dccb]/20">
                <th className="text-left py-3 pr-2">Đặt lúc</th>
                <th className="text-left py-3 pr-2">Khách hàng</th>
                <th className="text-left py-3 pr-2 hidden sm:table-cell">Tuyến</th>
                <th className="text-left py-3 pr-2">Khởi hành</th>
                <th className="text-center py-3 pr-2 hidden md:table-cell">Số khách</th>
                <th className="text-right py-3 pr-2">Giá</th>
                <th className="text-center py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((booking) => {
                const isNew = booking.status === 'new';
                return (
                  <tr
                    key={booking.id}
                    onClick={() => handleOpenDetail(booking)}
                    className={`border-b border-[#e8dccb]/15 transition duration-150 hover:bg-[#faf6ef]/60 cursor-pointer group ${
                      isNew ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Đặt lúc */}
                    <td className="py-3.5 pr-2">
                      <div className="inline-flex items-center gap-1.5">
                        {isNew && (
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                        )}
                        {booking.createdAt ? (
                          <span className="text-[11px] text-[#5f6b76] font-semibold">
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
                      <p className="font-extrabold text-[#102033] text-[13px] leading-tight group-hover:text-[#c88925] transition">{booking.customerName}</p>
                      <span className="text-[11px] text-[#c88925] font-bold flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {booking.phone}
                      </span>
                    </td>

                    {/* Tuyến */}
                    <td className="py-3.5 pr-2 hidden sm:table-cell">
                      <span className="text-[#102033] font-bold text-xs">{booking.routeName}</span>
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
                        <span className="text-xs font-bold text-[#102033]">
                          {booking.travelDate.split('-').reverse().slice(0, 2).join('/')}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-2 text-center hidden md:table-cell">
                      <span className="bg-[#f4f0e8] text-[#102033] font-black text-xs px-2 py-1 rounded-lg">
                        {booking.passengerCount}
                      </span>
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <span className="text-emerald-600 font-extrabold text-[13px]">
                        {formatMoney(booking.totalPrice)}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-sm text-[#5f6b76] font-bold italic">
            Không có đơn nào trong hôm nay.
          </div>
        )}
      </div>

      {/* ===== BOOKING DETAIL / PROCESS MODAL ===== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 font-sans backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] shadow-2xl animate-fade-in border-none">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8dccb]/30 bg-[#fffdf8] px-6 py-5 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedBooking.status} />
                  {selectedBooking.createdAt && (
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                      {formatCreatedAt(selectedBooking.createdAt)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#102033] mt-1">{selectedBooking.customerName}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-2xl p-2.5 bg-[#fbfaf7] hover:bg-[#f6efe1] text-[#5f6b76] focus:outline-none transition border-none"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Main Info Blocks */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#fbfaf7] p-4 border-none shadow-[0_2px_8px_rgba(16,32,51,0.02)]">
                  <h4 className="text-xs font-bold uppercase text-[#9c9287] tracking-wider mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm text-[#102033]">
                    <p><strong>Họ và tên:</strong> {selectedBooking.customerName}</p>
                    <p><strong>Số điện thoại:</strong> <a href={`tel:${selectedBooking.phone}`} className="text-[#c88925] font-bold underline">{selectedBooking.phone}</a></p>
                    {selectedBooking.customerEmail && <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#fbfaf7] p-4 border-none shadow-[0_2px_8px_rgba(16,32,51,0.02)]">
                  <h4 className="text-xs font-bold uppercase text-[#9c9287] tracking-wider mb-3">Thông tin hành trình</h4>
                  <div className="space-y-2 text-sm text-[#102033]">
                    <p><strong>Tuyến đường:</strong> {selectedBooking.routeName}</p>
                    <p><strong>Ngày khởi hành:</strong> {selectedBooking.travelDate} {selectedBooking.travelTime && <span className="font-black text-indigo-750 bg-indigo-50 px-1.5 py-0.5 rounded text-xs">{selectedBooking.travelTime}</span>}</p>
                    <p><strong>Số lượng:</strong> {selectedBooking.passengerCount} người</p>

                    {/* Edit Departure Time */}
                    <div className="pt-2.5 border-t border-[#e8dccb]/30 mt-2.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cập nhật Giờ đi</label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={modalTravelTime}
                          onChange={(e) => setModalTravelTime(e.target.value)}
                          className="rounded-xl border border-[#e8dccb]/60 bg-white text-[#102033] px-3 py-1.5 text-xs outline-none focus:border-[#c88925] font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateBookingTravelTime(selectedBooking.id, modalTravelTime);
                            setSelectedBooking({ ...selectedBooking, travelTime: modalTravelTime });
                            alert('Đã cập nhật giờ đi thành công!');
                          }}
                          className="rounded-xl bg-[#123047] hover:bg-[#04101b] px-3 py-1.5 text-xs font-bold text-white transition border-none"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#fbfaf7] p-4 border-none shadow-[0_2px_8px_rgba(16,32,51,0.02)] md:col-span-2">
                  <h4 className="text-xs font-bold uppercase text-[#9c9287] tracking-wider mb-3">Địa điểm đưa đón</h4>
                  <div className="space-y-2 text-sm text-[#102033]">
                    <p className="flex items-center gap-1.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c88925" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <strong>Điểm đón:</strong> {selectedBooking.pickupAddress}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c88925" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" y1="22" x2="4" y2="15" />
                      </svg>
                      <strong>Điểm trả:</strong> {selectedBooking.dropoffAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount & Status Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#04101b] p-5 text-white shadow-lg border-none">
                <div>
                  <p className="text-xs text-slate-400">Tổng số tiền cước</p>
                  <p className="text-2xl font-black text-[#f8c95c] mt-1">{formatMoney(selectedBooking.totalPrice)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-300">Trạng thái:</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              {/* Status Update Section */}
              {getNextStatuses(selectedBooking.status).length > 0 && (
                <div className="rounded-2xl bg-[#fbfaf7] p-5 border-none shadow-[0_2px_12px_rgba(16,32,51,0.02)]">
                  <h4 className="text-sm font-black text-[#102033] mb-3">Cập nhật tiến trình đơn hàng</h4>

                  {isUpdatingStatus ? (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-[#102033]">
                        Xác nhận đổi trạng thái sang: <span className="text-[#c88925] font-black">
                          {isUpdatingStatus === 'confirmed' ? 'Đã xác nhận' : isUpdatingStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </p>
                      <textarea
                        rows={3}
                        value={statusChangeNote}
                        onChange={(e) => setStatusChangeNote(e.target.value)}
                        placeholder="Nhập lý do đổi trạng thái hoặc ghi chú đi kèm... (Không bắt buộc)"
                        className="w-full rounded-2xl border-none p-3 text-sm outline-none bg-white text-[#102033] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(isUpdatingStatus)}
                          className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#a86e19] transition border-none"
                        >
                          Chấp nhận đổi
                        </button>
                        <button
                          onClick={() => setIsUpdatingStatus(null)}
                          className="rounded-2xl bg-[#f4f0e8] px-5 py-2.5 text-xs font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition border-none"
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getNextStatuses(selectedBooking.status).map((action) => (
                        <button
                          key={action.status}
                          onClick={() => setIsUpdatingStatus(action.status)}
                          className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 border-none ${action.style}`}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl p-4 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)]">
                  <h4 className="text-sm font-black text-[#102033] mb-2">Ghi chú của khách hàng</h4>
                  <div className="text-sm text-[#5f6b76] bg-white p-3 rounded-xl min-h-[80px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    {selectedBooking.customerNote || 'Không có ghi chú nào từ khách hàng.'}
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)]">
                  <h4 className="text-sm font-black text-[#102033] mb-2">Ghi chú nội bộ (Nhân viên)</h4>
                  <textarea
                    rows={3}
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="Chỉ nhân viên xem được: ví dụ đón ngã tư, khách có đồ cồng kềnh..."
                    className="w-full rounded-xl p-3 text-sm outline-none bg-white text-[#102033] shadow-[0_2px_8px_rgba(0,0,0,0.02)] mb-2 border-none"
                  />
                  <button
                    onClick={handleSaveInternalNote}
                    className="rounded-2xl bg-[#123047] px-5 py-2 text-xs font-bold text-white hover:bg-[#04101b] transition border-none"
                  >
                    Lưu ghi chú
                  </button>
                </div>
              </div>

              {/* History Logs */}
              <div className="rounded-2xl p-5 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)]">
                <h4 className="text-sm font-black text-[#102033] mb-3">Lịch sử xử lý đơn</h4>
                <div className="space-y-3.5 max-h-[180px] overflow-y-auto pr-2">
                  {activeHistory.length > 0 ? (
                    activeHistory.map((log) => (
                      <div key={log.id} className="relative pl-5 border-l-2 border-[#e8dccb] text-xs">
                        <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#c88925]"></div>
                        <p className="text-[#9c9287]">
                          {new Date(log.changedAt).toLocaleString('vi-VN')} - <strong>{log.changedBy}</strong>
                        </p>
                        <p className="mt-1 font-semibold text-[#102033]">
                          Trạng thái: <span className="text-slate-500">{log.oldStatus === 'created' ? 'Mới' : log.oldStatus}</span> &rarr; <span className="text-[#102033] font-bold">{log.newStatus}</span>
                        </p>
                        {log.note && <p className="mt-1 text-[#5f6b76] italic bg-white p-1.5 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.01)]">&ldquo;{log.note}&rdquo;</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#9c9287] italic">Không có lịch sử thay đổi.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 border-t border-[#e8dccb]/30 bg-[#fffdf8] px-6 py-4 flex justify-end z-10">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-2xl bg-[#04101b] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#123047] transition border-none"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
