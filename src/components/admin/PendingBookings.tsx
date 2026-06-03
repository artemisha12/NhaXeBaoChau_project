'use client';

import { useState } from 'react';
import StatusBadge from "@/components/common/StatusBadge";
import { useAdmin } from "@/context/AdminContext";
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
    if (isToday) {
      return `Đặt lúc: ${timeStr} (Hôm nay)`;
    }
    const dateFormatted = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    return `Đặt lúc: ${timeStr} (${dateFormatted})`;
  } catch (e) {
    return '';
  }
}

export default function PendingBookings() {
  const { 
    bookings, 
    updateBookingStatus, 
    updateBookingInternalNote,
    updateBookingTravelTime,
    bookingHistory 
  } = useAdmin();

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [modalTravelTime, setModalTravelTime] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<BookingStatus | null>(null);

  // Filter for pending/new bookings
  const pendingBookings = bookings.filter((b) => b.status === 'new');

  // Sort: newest first
  const sortedPending = [...pendingBookings].sort((a, b) => b.id - a.id);

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
    setSelectedBooking({
      ...selectedBooking,
      internalNote: internalNoteInput
    });
    alert('Đã lưu ghi chú nội bộ thành công!');
  };

  const handleUpdateStatus = (status: BookingStatus) => {
    if (!selectedBooking) return;
    updateBookingStatus(selectedBooking.id, status, statusChangeNote);
    
    // Close modal after updating status (or we can update state if we want to keep it open, 
    // but since it's no longer pending, it's best to close it)
    setSelectedBooking(null);
    setStatusChangeNote('');
    setIsUpdatingStatus(null);
  };

  const activeHistory = selectedBooking 
    ? bookingHistory.filter(h => h.bookingId === selectedBooking.id)
    : [];

  return (
    <div className="overflow-hidden rounded-3xl bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans h-full flex flex-col border-none">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
        <div>
          <h2 className="text-base font-black text-[#102033]">Đơn cần xử lý</h2>
          <p className="text-xs text-[#5f6b76] mt-0.5">Các yêu cầu đặt xe mới nhận cần gọi điện xác nhận và xếp xe.</p>
        </div>
        <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-black text-amber-700">
          {pendingBookings.length} đơn mới
        </span>
      </div>

      {/* Bookings Card List */}
      <div className="mt-5 flex-1 space-y-6 overflow-y-auto max-h-[520px] pr-1">
        {sortedPending.length > 0 ? (
          sortedPending.map((booking) => (
            <div 
              key={booking.id}
              onClick={() => handleOpenDetail(booking)}
              className="group cursor-pointer rounded-2xl bg-white hover:bg-[#fffefb] p-5 transition duration-300 shadow-[0_6px_24px_rgba(16,32,51,0.03)] hover:shadow-[0_12px_32px_rgba(16,32,51,0.08)] border border-[#e8dccb]/30 border-l-4 border-l-amber-500 flex flex-col gap-3.5"
            >
              {/* Top row: Route and Price */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-extrabold text-[#102033] group-hover:text-[#c88925] transition flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    {booking.routeName}
                  </span>
                  {booking.createdAt && (
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 inline-block">
                      {formatCreatedAt(booking.createdAt)}
                    </span>
                  )}
                </div>
                <span className="text-base font-extrabold text-emerald-600">
                  {formatMoney(booking.totalPrice)}
                </span>
              </div>

              {/* Middle row: Customer info & Date */}
              <div className="grid grid-cols-2 gap-6 text-xs pt-3 border-t border-dashed border-[#e8dccb]/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Hành khách
                  </div>
                  <p className="font-extrabold text-[#102033] text-sm">{booking.customerName}</p>
                  <p className="text-slate-600 font-bold flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 text-[#c88925]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {booking.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Thời gian khởi hành
                  </div>
                  <p className="font-extrabold text-[#102033] text-sm flex items-center gap-1.5">
                    {booking.travelTime && <span className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-[10px] font-black">{booking.travelTime}</span>}
                    <span>{booking.travelDate}</span>
                  </p>
                  <p className="text-[#c88925] font-extrabold flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 text-[#c88925]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {booking.passengerCount} người
                  </p>
                </div>
              </div>

              {/* Address row */}
              <div className="text-xs pt-3 border-t border-[#e8dccb]/30 flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5 truncate max-w-[80%] text-slate-600" title={booking.pickupAddress}>
                  <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="truncate">Đón: <strong className="text-[#102033] font-bold">{booking.pickupAddress}</strong></span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider shrink-0 uppercase">
                  {booking.code}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-sm text-[#5f6b76] font-bold italic">
            Không có đơn nào cần xử lý.
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 font-sans backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] shadow-2xl animate-fade-in border-none">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8dccb]/30 bg-[#fffdf8] px-6 py-5 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#9c9287] uppercase tracking-wider">Đang chờ xử lý</span>
                  {selectedBooking.createdAt && (
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md">
                      {formatCreatedAt(selectedBooking.createdAt)}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-[#102033]">{selectedBooking.code}</h3>
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
                            setSelectedBooking({
                              ...selectedBooking,
                              travelTime: modalTravelTime
                            });
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
                  <span className="text-sm font-semibold text-slate-300">Trạng thái hiện tại:</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              {/* Status Update Section */}
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
                    <button
                      onClick={() => setIsUpdatingStatus('confirmed')}
                      className="rounded-2xl bg-emerald-100 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-250 transition flex items-center gap-1 border-none"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Gọi &amp; Xác nhận đơn
                    </button>
                    <button
                      onClick={() => setIsUpdatingStatus('cancelled')}
                      className="rounded-2xl bg-rose-100 px-4 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-200 transition flex items-center gap-1 border-none"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Hủy đơn đặt
                    </button>
                  </div>
                )}
              </div>

              {/* Internal Notes & Customer Notes */}
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
