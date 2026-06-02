'use client';

import { useState, useRef } from 'react';
import { useAdmin } from "@/context/AdminContext";
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
  const { vehicles, addVehicle, updateVehicle, toggleVehicleStatus } = useAdmin();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form state — tên biến khớp với cột DB
  const [vehicleName, setVehicleName] = useState('');       // vehicle_name
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]); // vehicle_type
  const [seatCount, setSeatCount] = useState(7);            // seat_count
  const [licensePlate, setLicensePlate] = useState('');     // license_plate
  const [imageUrl, setImageUrl] = useState('');             // image_url
  const [description, setDescription] = useState('');       // description

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim() || !licensePlate.trim()) return;

    const payload = {
      name: vehicleName.trim(),
      type: vehicleType,
      seats: seatCount,
      plateNumber: licensePlate.trim().toUpperCase(),
      imageUrl: imageUrl.trim(),
      description: description.trim(),
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, { ...payload, status: editingVehicle.status });
    } else {
      addVehicle(payload);
    }
    setIsOpen(false);
  };

  return (
    <div className="rounded-3xl bg-[#fffdf8] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans border-none">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-[#102033]">Danh sách đội xe</h2>
          <p className="text-sm text-[#5f6b76]">Tên xe, biển số, loại xe, số chỗ, ảnh và mô tả.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition duration-150 border-none"
        >
          + Thêm xe mới
        </button>
      </div>

      {/* Grid xe */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`rounded-3xl overflow-hidden transition duration-200 shadow-[0_4px_16px_rgba(16,32,51,0.02)] hover:shadow-[0_8px_24px_rgba(16,32,51,0.05)] border-none ${vehicle.status === 'hidden'
                ? 'bg-[#fbfaf7]/60 opacity-60'
                : 'bg-[#fbfaf7]'
              }`}
          >
            {/* Ảnh xe — image_url */}
            <div className="relative h-40 bg-[#04101b] flex items-center justify-center overflow-hidden">
              {vehicle.imageUrl ? (
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-[#1a2e40]" />
              )}
              {/* Badge trạng thái */}
              <span className={`absolute top-3 right-3 rounded-xl px-2.5 py-1 text-xs font-bold ${vehicle.status === 'active'
                  ? 'bg-[#d1fae5] text-[#15803d]'
                  : 'bg-slate-200 text-slate-700'
                }`}>
                {vehicle.status === 'active' ? 'Đang chạy' : 'Đang ẩn'}
              </span>
            </div>

            {/* Nội dung card */}
            <div className="p-5">
              {/* Tên xe — vehicle_name */}
              <h3 className="text-base font-black text-[#102033] leading-tight">{vehicle.name}</h3>
              {/* Loại xe — vehicle_type */}
              <p className="text-xs font-bold text-[#c88925] uppercase tracking-wider mt-1">{vehicle.type}</p>
              {/* Mô tả — description */}
              <p className="mt-2 text-sm text-[#5f6b76] line-clamp-2 min-h-[38px]">{vehicle.description || '—'}</p>

              {/* Thông tin số liệu */}
              <div className="mt-4 flex justify-between border-t border-[#e8dccb]/20 pt-4 text-sm font-semibold text-[#5f6b76]">
                {/* seat_count */}
                <span>Chỗ ngồi: <strong className="text-[#102033]">{vehicle.seats} chỗ</strong></span>
                {/* license_plate */}
                <span>Biển số: <strong className="text-[#102033]">{vehicle.plateNumber}</strong></span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-[#e8dccb]/20 pt-4">
                <button
                  onClick={() => handleOpenEdit(vehicle)}
                  className="flex-1 rounded-2xl bg-[#fffdf8] py-2 text-xs font-bold text-[#5f6b76] hover:bg-[#f6efe1] transition border-none shadow-[0_2px_6px_rgba(16,32,51,0.02)]"
                >
                  Sửa thông tin
                </button>
                <button
                  onClick={() => toggleVehicleStatus(vehicle.id)}
                  className={`flex-1 rounded-2xl py-2 text-xs font-bold transition border-none ${vehicle.status === 'active'
                      ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                >
                  {vehicle.status === 'active' ? 'Ẩn xe' : 'Hiện xe'}
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  {imageUrl ? (
                    <div className="relative group">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-36 object-cover"
                      />
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
                      <span className="text-xs text-[#9a9a9a]/70">JPG, PNG, WEBP — tối đa 5MB</span>
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
                  className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition border-none"
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Thêm xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
