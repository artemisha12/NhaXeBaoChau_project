'use client';

import { useState } from 'react';
import { useAdmin } from "@/context/AdminContext";
import type { Vehicle } from "@/lib/types";

export default function VehicleTable() {
  const { vehicles, addVehicle, updateVehicle, toggleVehicleStatus } = useAdmin();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [seats, setSeats] = useState(4);
  const [plateNumber, setPlateNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setName('');
    setType('Xe ghép cao cấp');
    setSeats(7);
    setPlateNumber('');
    setDescription('');
    setIsOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setType(vehicle.type);
    setSeats(vehicle.seats);
    setPlateNumber(vehicle.plateNumber);
    setDescription(vehicle.description);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plateNumber) return;

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        name,
        type,
        seats,
        plateNumber,
        description,
        status: editingVehicle.status
      });
    } else {
      addVehicle({
        name,
        type,
        seats,
        plateNumber,
        description
      });
    }

    setIsOpen(false);
  };

  return (
    <div className="rounded-3xl border border-[#e8dccb] bg-[#fffdf8] p-6 shadow-sm font-sans">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-[#102033]">Danh sách đội xe</h2>
          <p className="text-sm text-[#5f6b76]">Cập nhật thông tin xe, biển số và trạng thái hoạt động.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition duration-150"
        >
          + Thêm xe mới
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div 
            key={vehicle.id} 
            className={`rounded-3xl border p-5 transition duration-200 ${
              vehicle.status === 'hidden' 
                ? 'border-[#e8dccb]/60 bg-[#fbfaf7]/60 opacity-60' 
                : 'border-[#e8dccb] bg-[#fbfaf7] hover:shadow-md'
            }`}
          >
             <div className="flex items-center justify-between">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#04101b] text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                vehicle.status === 'active' 
                  ? 'bg-[#d1fae5] text-[#15803d] border border-[#a7f3d0]' 
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {vehicle.status === 'active' ? 'Đang chạy' : 'Đang ẩn'}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-black text-[#102033]">{vehicle.name}</h3>
            <p className="text-xs font-bold text-[#c88925] uppercase tracking-wider mt-1">{vehicle.type}</p>
            <p className="mt-3 text-sm text-[#5f6b76] line-clamp-2 min-h-[40px]">{vehicle.description}</p>
            
            <div className="mt-4 flex justify-between border-t border-[#e8dccb]/50 pt-4 text-sm font-semibold text-[#5f6b76]">
              <span>Chỗ ngồi: <strong className="text-[#102033]">{vehicle.seats} chỗ</strong></span>
              <span>Biển số: <strong className="text-[#102033]">{vehicle.plateNumber}</strong></span>
            </div>

            <div className="mt-4 flex gap-2 border-t border-[#e8dccb]/50 pt-4">
              <button 
                onClick={() => handleOpenEdit(vehicle)}
                className="flex-1 rounded-2xl border border-[#e8dccb] py-2 text-xs font-bold text-[#5f6b76] hover:bg-[#f6efe1] transition"
              >
                Sửa thông tin
              </button>
              <button 
                onClick={() => toggleVehicleStatus(vehicle.id)}
                className={`flex-1 rounded-2xl py-2 text-xs font-bold border transition ${
                  vehicle.status === 'active'
                    ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {vehicle.status === 'active' ? 'Ẩn xe' : 'Hiện xe'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] border border-[#e8dccb] p-6 shadow-2xl animate-fade-in font-sans">
            <div className="flex items-center justify-between border-b border-[#e8dccb] pb-4">
              <h3 className="text-lg font-black text-[#102033]">
                {editingVehicle ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-[#e8dccb] p-2 text-[#5f6b76] hover:bg-[#f6efe1] transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Tên xe</label>
                <input 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Limousine 7 chỗ, Sedan 4 chỗ..." 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Loại dịch vụ</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  <option value="Xe ghép cao cấp">Xe ghép cao cấp</option>
                  <option value="Xe riêng / bao chuyến">Xe riêng / bao chuyến</option>
                  <option value="Nhóm đông người">Nhóm đông người</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Số lượng chỗ</label>
                  <input 
                    type="number"
                    min={2}
                    max={50}
                    value={seats}
                    onChange={(e) => setSeats(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Biển kiểm soát</label>
                  <input 
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="Ví dụ: 75A-123.45" 
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Mô tả tiện nghi</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Ghế da cao cấp, sạc USB, khăn lạnh nước suối miễn phí..." 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf8] text-[#102033] p-3 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#e8dccb]/50 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl bg-[#f4f0e8] px-5 py-2.5 text-sm font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
