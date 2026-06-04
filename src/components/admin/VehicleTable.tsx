'use client';

import { useState, useRef } from 'react';
import { useAdmin } from "@/context/AdminContext";
import { uploadVehicleImageAction } from '@/app/actions/vehicles/actions';
import type { Vehicle } from "@/lib/types";



const VEHICLE_TYPES = [
  'SEDAN 4 CHỖ',
  'SEDAN CAO CẤP',
  'SUV 7 CHỖ',
  'SUV ĐIỆN LUXURY',
  'MPV HẠNG SANG',
  'LIMOUSINE 9 CHỖ',
  'MINIBUS 16 CHỖ',
];

export default function VehicleTable() {
  const { vehicles, addVehicle, updateVehicle, toggleVehicleStatus, deleteVehicle } = useAdmin();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Form state — tên biến khớp với cột DB
  const [vehicleName, setVehicleName] = useState('');       // vehicle_name
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]); // vehicle_type
  const [seatCount, setSeatCount] = useState(7);            // seat_count
  const [licensePlate, setLicensePlate] = useState('');     // license_plate
  const [imageUrl, setImageUrl] = useState('');             // image_url
  const [description, setDescription] = useState('');       // description

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.');
      return;
    }
    setUploading(true);
    setErrorMsg('');
    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadVehicleImageAction(fd);
    setUploading(false);
    if (result.success && result.url) {
      setImageUrl(result.url);
    } else {
      setErrorMsg(result.error || 'Upload ảnh thất bại.');
    }
  };

  const resetForm = () => {
    setVehicleName('');
    setVehicleType(VEHICLE_TYPES[0]);
    setSeatCount(7);
    setLicensePlate('');
    setImageUrl('');
    setDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    resetForm();
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setVehicleName(v.name);
    setVehicleType(v.type);
    setSeatCount(v.seats);
    setLicensePlate(v.plateNumber);
    setImageUrl(v.imageUrl ?? '');
    setDescription(v.description);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim() || !licensePlate.trim()) return;
    setSaving(true);
    setErrorMsg('');

    const payload = {
      name: vehicleName.trim(),
      type: vehicleType,
      seats: seatCount,
      plateNumber: licensePlate.trim().toUpperCase(),
      imageUrl: imageUrl.trim(),
      description: description.trim(),
    };

    const result = editingVehicle
      ? await updateVehicle(editingVehicle.id, { ...payload, status: editingVehicle.status })
      : await addVehicle(payload);

    setSaving(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      setErrorMsg(result.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    await toggleVehicleStatus(id);
    setTogglingId(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa xe "${name}" và toàn bộ gói giá liên quan?\n\nThao tác này không thể hoàn tác.`)) return;
    setDeletingId(id);
    const result = await deleteVehicle(id);
    setDeletingId(null);
    if (!result.success) alert(result.error || 'Xóa thất bại.');
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Danh sách đội xe</h2>
          <p className="text-xs text-slate-400 mt-0.5">{vehicles.length} xe trong hệ thống</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition border-none"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm xe mới
        </button>
      </div>

      {/* Grid xe */}
      <div className="p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => {
          const isHidden = vehicle.status === 'hidden';
          return (
            <div
              key={vehicle.id}
              className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                isHidden
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-amber-100 bg-white hover:shadow-md hover:border-amber-200'
              }`}
            >
              {/* Ảnh xe */}
              <div className="relative h-44 bg-slate-800 overflow-hidden">
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className={`h-full w-full object-cover transition-opacity ${isHidden ? 'opacity-40 grayscale' : ''}`}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-slate-800">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4a6580" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
                    </svg>
                    <span className="text-xs text-slate-500">Chưa có ảnh</span>
                  </div>
                )}

                {/* Overlay khi ẩn */}
                {isHidden && (
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <span className="bg-slate-900/70 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      Đang ẩn khỏi web
                    </span>
                  </div>
                )}

                {/* Status badge */}
                {!isHidden && (
                  <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Đang chạy
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Tên + loại */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold leading-tight ${isHidden ? 'text-slate-500' : 'text-slate-900'}`}>
                      {vehicle.name}
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${isHidden ? 'text-slate-400' : 'text-amber-600'}`}>
                      {vehicle.type}
                    </span>
                  </div>
                </div>

                {/* Mô tả */}
                <p className={`mt-2 text-xs leading-relaxed line-clamp-2 ${isHidden ? 'text-slate-400' : 'text-slate-500'}`}>
                  {vehicle.description || 'Chưa có mô tả'}
                </p>

                {/* Stats */}
                <div className={`mt-3 flex items-center justify-between text-xs border-t pt-3 ${isHidden ? 'border-slate-200' : 'border-slate-100'}`}>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="font-semibold text-slate-700">{vehicle.seats} chỗ</span>
                  </span>
                  <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${isHidden ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-700'}`}>
                    {vehicle.plateNumber}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(vehicle)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleToggle(vehicle.id)}
                    disabled={togglingId === vehicle.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition border disabled:opacity-50 ${
                      isHidden
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    {togglingId === vehicle.id ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : isHidden ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                        Hiện lên web
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                        Ẩn khỏi web
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id, vehicle.name)}
                    disabled={deletingId === vehicle.id}
                    className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    title="Xóa xe"
                  >
                    {deletingId === vehicle.id ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm / Sửa */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] p-6 shadow-2xl animate-fade-in font-sans border-none">
            <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
              <h3 className="text-lg font-black text-[#102033]">
                {editingVehicle ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-[#fbfaf7] hover:bg-[#f6efe1] p-2 text-[#5f6b76] transition border-none focus:outline-none"
                aria-label="Đóng"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">

              {/* vehicle_name */}
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                  Tên xe <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="VD: Limousine 9 chỗ, Sedan 4 chỗ..."
                  className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              {/* vehicle_type */}
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                  Loại xe (vehicle_type)
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* seat_count + license_plate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                    Số chỗ (seat_count)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={seatCount}
                    onChange={(e) => setSeatCount(Number(e.target.value))}
                    className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                    Biển kiểm soát <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="VD: 75A-123.45"
                    className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
              </div>

              {/* image_url — upload từ máy */}
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                  Ảnh xe
                </label>

                {/* Khu vực hiển thị / click để chọn */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border border-dashed border-[#e8dccb]/80 bg-[#fbfaf7] hover:bg-[#fff8e8] transition overflow-hidden"
                  style={{ minHeight: '120px' }}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center h-28 gap-2 text-amber-600">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                      <span className="text-xs font-semibold">Đang upload lên Storage...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="relative group">
                      <img src={imageUrl} alt="Preview" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-sm font-bold">Nhấn để đổi ảnh</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 gap-2 text-[#9a9a9a]">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                      <span className="text-xs font-semibold">Nhấn để chọn ảnh từ máy</span>
                      <span className="text-xs text-[#9a9a9a]/70">JPG, PNG, WEBP — tối đa 10MB</span>
                    </div>
                  )}
                </div>

                {/* Input ẩn */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Nút xóa ảnh */}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-2 text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>

              {/* description */}
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase tracking-wide mb-1.5">
                  Mô tả tiện nghi (description)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Ghế da cao cấp, sạc USB, khăn lạnh, nước suối miễn phí..."
                  className="w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] p-3 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              {errorMsg && (
                <p className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 border-t border-[#e8dccb]/20 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl bg-[#f4f0e8] px-5 py-2.5 text-sm font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition border-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition border-none disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : uploading ? 'Chờ upload ảnh...' : editingVehicle ? 'Lưu thay đổi' : 'Thêm xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
