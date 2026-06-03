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

export default function BookingTable() {
  const { 
    bookings, 
    routes, 
    packages,
    addBooking,
    updateBookingStatus, 
    updateBookingInternalNote,
    updateBookingTravelTime,
    bookingHistory 
  } = useAdmin();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'tomorrow', 'custom'
  const [customDate, setCustomDate] = useState('');

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [modalTravelTime, setModalTravelTime] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<BookingStatus | null>(null);

  // Manual booking modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCustomerName, setAddCustomerName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPkgId, setAddPkgId] = useState('');
  const [addTravelDate, setAddTravelDate] = useState('');
  const [addTravelTime, setAddTravelTime] = useState('');
  const [addPickup, setAddPickup] = useState('');
  const [addDropoff, setAddDropoff] = useState('');
  const [addPassengerCount, setAddPassengerCount] = useState(1);
  const [addCustomPrice, setAddCustomPrice] = useState<number | null>(null);
  const [addEmail, setAddEmail] = useState('');
  const [addNote, setAddNote] = useState('');

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  const tomorrowStr = getLocalDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));

  // Filter logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery) ||
      booking.code.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesRoute = routeFilter === 'all' || booking.routeName === routeFilter;

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      if (dateFilter === 'today') return booking.travelDate === todayStr;
      if (dateFilter === 'tomorrow') return booking.travelDate === tomorrowStr;
      if (dateFilter === 'custom') return booking.travelDate === customDate;
      return true;
    })();

    return matchesSearch && matchesStatus && matchesRoute && matchesDate;
  });

  // Sort logic: new bookings first, then latest ID first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.status === 'new' && b.status !== 'new') return -1;
    if (a.status !== 'new' && b.status === 'new') return 1;
    return b.id - a.id;
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
    // Update local state to reflect change immediately
    setSelectedBooking({
      ...selectedBooking,
      internalNote: internalNoteInput
    });
    alert('Đã lưu ghi chú nội bộ thành công!');
  };

  const handleUpdateStatus = (status: BookingStatus) => {
    if (!selectedBooking) return;
    updateBookingStatus(selectedBooking.id, status, statusChangeNote);
    
    // Update local state
    setSelectedBooking({
      ...selectedBooking,
      status
    });
    setStatusChangeNote('');
    setIsUpdatingStatus(null);
  };

  // Get status history for the active booking
  const activeHistory = selectedBooking 
    ? bookingHistory.filter(h => h.bookingId === selectedBooking.id)
    : [];
  return (
    <div className="overflow-hidden rounded-3xl bg-[#fffdf8] shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans border-none">
      {/* Header and buttons */}
      <div className="flex flex-col gap-4 border-b border-[#e8dccb]/30 p-5 sm:flex-row sm:items-center sm:justify-between bg-[#fffdf8]">
        <div>
          <h2 className="text-lg font-black text-[#102033]">Danh sách đơn đặt vé</h2>
          <p className="text-sm text-[#5f6b76]">Quản lý trạng thái, liên hệ hành khách và phân bổ xe.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="rounded-2xl bg-[#c88925] hover:bg-[#a86e19] text-white px-5 py-2.5 text-sm font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Đặt vé thủ công
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 bg-[#fbfaf7] border-b border-[#e8dccb]/20 p-5">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]" 
            placeholder="Tìm tên, SĐT hoặc mã đơn..." 
          />
        </div>

        {/* Route filter */}
        <select 
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả tuyến đường</option>
          {routes.map(r => (
            <option key={r.id} value={`${r.from} → ${r.to}`}>{r.from} &rarr; {r.to}</option>
          ))}
        </select>

        {/* Date filter dropdown */}
        <select 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả ngày đi</option>
          <option value="today">Đi hôm nay</option>
          <option value="tomorrow">Đi ngày mai</option>
          <option value="custom">Chọn ngày khác...</option>
        </select>

        {/* Custom date picker */}
        {dateFilter === 'custom' && (
          <input 
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
          />
        )}

        {/* Status filter */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="new">Mới gửi</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#123047] text-white">
            <tr>
              <th className="px-5 py-4">Mã đơn</th>
              <th className="px-5 py-4">Khách hàng</th>
              <th className="px-5 py-4">Tuyến</th>
              <th className="px-5 py-4">Ngày đi</th>
              <th className="px-5 py-4">Số khách</th>
              <th className="px-5 py-4">Tổng tiền</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dccb]/30">
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking) => {
                const isNew = booking.status === 'new';
                return (
                  <tr 
                    key={booking.id} 
                    className={`transition duration-150 border-b border-[#e8dccb]/30 ${
                      isNew 
                        ? "bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-l-amber-500 font-medium" 
                        : "hover:bg-[#f6efe1]/30"
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-[#102033]">
                      <div className="flex items-center gap-1.5">
                        {isNew && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping shrink-0" title="Chưa xử lý"></span>
                        )}
                        <span>{booking.code}</span>
                      </div>
                      {booking.createdAt && (
                        <p className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                          {formatCreatedAt(booking.createdAt)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#102033]">{booking.customerName}</p>
                      <p className="text-[#5f6b76]">{booking.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-[#102033] font-semibold">{booking.routeName}</td>
                    <td className="px-5 py-4 text-[#5f6b76] font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          {booking.travelTime && (
                            <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-[11px] font-black shrink-0">
                              {booking.travelTime}
                            </span>
                          )}
                          <span>{booking.travelDate}</span>
                        </div>
                        {booking.travelDate === todayStr && (
                          <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider mt-0.5">Hôm nay</span>
                        )}
                        {booking.travelDate === tomorrowStr && (
                          <span className="text-[10px] text-blue-600 font-black uppercase tracking-wider mt-0.5">Ngày mai</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#102033] font-bold">{booking.passengerCount} người</td>
                    <td className="px-5 py-4 font-black text-[#102033]">{formatMoney(booking.totalPrice)}</td>
                    <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => handleOpenDetail(booking)}
                        className="rounded-2xl bg-[#ffefc2] hover:bg-[#ffe08a] px-4 py-2 text-xs font-bold text-[#805112] transition border-none"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[#5f6b76] font-bold">
                  Không tìm thấy đơn đặt vé nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 font-sans backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] shadow-2xl animate-fade-in border-none">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8dccb]/30 bg-[#fffdf8] px-6 py-5 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#9c9287] uppercase tracking-wider">Chi tiết đơn vé</span>
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
                className="rounded-2xl bg-[#fbfaf7] hover:bg-[#f6efe1] p-2.5 text-[#5f6b76] focus:outline-none transition border-none"
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
                <div className="rounded-2xl bg-[#fbfaf7] p-4 shadow-[0_2px_8px_rgba(16,32,51,0.02)] border-none">
                  <h4 className="text-xs font-bold uppercase text-[#9c9287] tracking-wider mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm text-[#102033]">
                    <p><strong>Họ và tên:</strong> {selectedBooking.customerName}</p>
                    <p><strong>Số điện thoại:</strong> <a href={`tel:${selectedBooking.phone}`} className="text-[#c88925] font-bold underline">{selectedBooking.phone}</a></p>
                    {selectedBooking.customerEmail && <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#fbfaf7] p-4 shadow-[0_2px_8px_rgba(16,32,51,0.02)] border-none">
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

                <div className="rounded-2xl bg-[#fbfaf7] p-4 shadow-[0_2px_8px_rgba(16,32,51,0.02)] md:col-span-2 border-none">
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
              <div className="rounded-2xl bg-[#fbfaf7] p-5 shadow-[0_2px_12px_rgba(16,32,51,0.02)] border-none">
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
                      className="w-full rounded-2xl p-3 text-sm outline-none bg-white text-[#102033] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-none"
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
                    {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                      <button
                        onClick={() => setIsUpdatingStatus('confirmed')}
                        className="rounded-2xl bg-emerald-100 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-250 transition flex items-center gap-1 border-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Gọi &amp; Xác nhận đơn
                      </button>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <button
                        onClick={() => setIsUpdatingStatus('completed')}
                        className="rounded-2xl bg-sky-100 px-4 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-200 transition flex items-center gap-1 border-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Hoàn thành chuyến chạy
                      </button>
                    )}
                    {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
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
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <button
                        onClick={() => {
                          setIsUpdatingStatus('confirmed');
                          setStatusChangeNote('Khôi phục lại đơn đã hủy.');
                        }}
                        className="rounded-2xl bg-[#ffefc2] px-4 py-2.5 text-xs font-bold text-[#805112] hover:bg-[#ffe08a] transition flex items-center gap-1 border-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M16 3h5v5" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <path d="M8 21H3v-5" />
                        </svg>
                        Khôi phục đơn
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Internal Notes & Customer Notes */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl p-4 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)] border-none">
                  <h4 className="text-sm font-black text-[#102033] mb-2">Ghi chú của khách hàng</h4>
                  <div className="text-sm text-[#5f6b76] bg-white p-3 rounded-xl min-h-[80px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-none">
                    {selectedBooking.customerNote || 'Không có ghi chú nào từ khách hàng.'}
                  </div>
                </div>

                <div className="rounded-2xl p-4 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)] border-none">
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
              <div className="rounded-2xl p-5 bg-[#fbfaf7] shadow-[0_2px_8px_rgba(16,32,51,0.02)] border-none">
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
                        {log.note && <p className="mt-1 text-[#5f6b76] italic bg-white p-1.5 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.01)] border-none">&ldquo;{log.note}&rdquo;</p>}
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

      {/* Manual Booking Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 font-sans backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] shadow-2xl animate-fade-in border-none">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8dccb]/30 bg-[#fffdf8] px-6 py-5 z-10">
              <div>
                <span className="text-xs font-bold text-[#9c9287] uppercase tracking-wider">Thao tác quản trị</span>
                <h3 className="text-xl font-black text-[#102033]">Đặt vé thủ công</h3>
              </div>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="rounded-2xl bg-[#fbfaf7] hover:bg-[#f6efe1] p-2.5 text-[#5f6b76] focus:outline-none transition border-none"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!addCustomerName || !addPhone || !addPkgId || !addTravelDate || !addPickup || !addDropoff) {
                  alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
                  return;
                }
                const selectedPkg = packages.find(p => p.id === Number(addPkgId));
                if (!selectedPkg) return;

                const unitPrice = selectedPkg.price;
                const isShared = selectedPkg.type === 'shared-seat';
                const computedPrice = isShared ? unitPrice * addPassengerCount : unitPrice;
                const totalPrice = addCustomPrice !== null ? addCustomPrice : computedPrice;

                addBooking({
                  customerName: addCustomerName,
                  phone: addPhone,
                  routeName: selectedPkg.routeName,
                  travelDate: addTravelDate,
                  travelTime: addTravelTime || undefined,
                  pickupAddress: addPickup,
                  dropoffAddress: addDropoff,
                  passengerCount: addPassengerCount,
                  totalPrice,
                  priceAtBooking: unitPrice,
                  customerEmail: addEmail || undefined,
                  customerNote: addNote || undefined,
                });

                alert('Đã tạo đơn đặt vé thủ công thành công!');
                
                // Reset form
                setAddCustomerName('');
                setAddPhone('');
                setAddPkgId('');
                setAddTravelDate('');
                setAddTravelTime('');
                setAddPickup('');
                setAddDropoff('');
                setAddPassengerCount(1);
                setAddCustomPrice(null);
                setAddEmail('');
                setAddNote('');
                setIsAddOpen(false);
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Tên khách hàng *</label>
                <input 
                  required
                  value={addCustomerName}
                  onChange={(e) => setAddCustomerName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Số điện thoại *</label>
                <input 
                  required
                  type="tel"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="Nhập số điện thoại..."
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Chọn gói giá dịch vụ *</label>
                <select 
                  required
                  value={addPkgId}
                  onChange={(e) => setAddPkgId(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  <option value="">-- Chọn tuyến &amp; loại xe --</option>
                  {packages.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.routeName} - {p.vehicleName} ({p.type === 'shared-seat' ? 'Xe ghép' : 'Bao xe'}) - {formatMoney(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Ngày đi *</label>
                  <input 
                    required
                    type="date"
                    value={addTravelDate}
                    onChange={(e) => setAddTravelDate(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Giờ đi *</label>
                  <input 
                    required
                    type="time"
                    value={addTravelTime}
                    onChange={(e) => setAddTravelTime(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Số hành khách *</label>
                  <input 
                    required
                    type="number"
                    min={1}
                    max={50}
                    value={addPassengerCount}
                    onChange={(e) => setAddPassengerCount(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Địa chỉ đón tận nơi *</label>
                <input 
                  required
                  value={addPickup}
                  onChange={(e) => setAddPickup(e.target.value)}
                  placeholder="Ví dụ: 12 Hùng Vương, Huế..."
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Địa chỉ trả tận nơi *</label>
                <input 
                  required
                  value={addDropoff}
                  onChange={(e) => setAddDropoff(e.target.value)}
                  placeholder="Ví dụ: Cầu Rồng, Đà Nẵng..."
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Email (tùy chọn)</label>
                  <input 
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="khachhang@gmail.com"
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2 text-sm outline-none focus:border-[#c88925]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Thực thu tùy chỉnh (VNĐ)</label>
                  <input 
                    type="number"
                    placeholder={
                      addPkgId 
                        ? String(packages.find(p => p.id === Number(addPkgId))?.type === 'shared-seat' 
                            ? (packages.find(p => p.id === Number(addPkgId))?.price || 0) * addPassengerCount 
                            : (packages.find(p => p.id === Number(addPkgId))?.price || 0)) 
                        : "Tính tự động"
                    }
                    value={addCustomPrice === null ? '' : addCustomPrice}
                    onChange={(e) => setAddCustomPrice(e.target.value === '' ? null : Number(e.target.value))}
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2 text-sm outline-none focus:border-[#c88925]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Ghi chú hành khách (tùy chọn)</label>
                <textarea 
                  rows={2}
                  value={addNote}
                  onChange={(e) => setAddNote(e.target.value)}
                  placeholder="Khách mang theo hành lý cồng kềnh..."
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] p-3 text-sm outline-none focus:border-[#c88925]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 border-t border-[#e8dccb]/20 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-2xl bg-[#f4f0e8] px-5 py-2.5 text-sm font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition border-none focus:outline-none"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition border-none focus:outline-none"
                >
                  Tạo đơn đặt vé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
