'use client';

import { useState } from 'react';
import { useAdmin } from "@/context/AdminContext";
import type { RouteItem } from "@/lib/types";

export default function RouteTable() {
  const { routes, packages, addRoute, updateRoute, toggleRouteStatus } = useAdmin();

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);

  // Form states
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [distanceKm, setDistanceKm] = useState(100);
  const [duration, setDuration] = useState('');

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFrom('');
    setTo('');
    setDistanceKm(50);
    setDuration('1 giờ');
    setIsOpen(true);
  };

  const handleOpenEdit = (route: RouteItem) => {
    setEditingRoute(route);
    setFrom(route.from);
    setTo(route.to);
    setDistanceKm(route.distanceKm);
    setDuration(route.duration);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !duration) return;

    if (editingRoute) {
      updateRoute(editingRoute.id, {
        from,
        to,
        distanceKm,
        duration,
        status: editingRoute.status
      });
    } else {
      addRoute({
        from,
        to,
        distanceKm,
        duration
      });
    }

    setIsOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-[#fffdf8] shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans border-none">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 p-5">
        <div>
          <h2 className="text-lg font-black text-[#102033]">Tuyến đường vận hành</h2>
          <p className="text-sm text-[#5f6b76]">Cơ sở để xây dựng bảng cước phí xe ghép và bao chuyến.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition duration-150 border-none"
        >
          + Thêm tuyến
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#123047] text-white">
            <tr>
              <th className="px-5 py-4">Điểm đi</th>
              <th className="px-5 py-4">Điểm đến</th>
              <th className="px-5 py-4">Quãng đường</th>
              <th className="px-5 py-4">Thời gian dự kiến</th>
              <th className="px-5 py-4">Số gói cước</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dccb]/30">
            {routes.map((route) => {
              const routeName = `${route.from} → ${route.to}`;
              const packageCount = packages.filter(p => p.routeName === routeName).length;
              return (
                <tr 
                  key={route.id} 
                  className={`hover:bg-[#f6efe1]/30 transition duration-150 ${
                    route.status === 'hidden' ? 'opacity-50 bg-[#fbfaf7]/60' : ''
                  }`}
                >
                  <td className="px-5 py-4 font-bold text-[#102033]">{route.from}</td>
                  <td className="px-5 py-4 font-bold text-[#102033]">{route.to}</td>
                  <td className="px-5 py-4 text-[#102033] font-bold">{route.distanceKm} km</td>
                  <td className="px-5 py-4 text-[#5f6b76] font-semibold">{route.duration}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-xl bg-[#f0ebd9]/80 px-2.5 py-1 text-xs font-black text-[#805112]">
                      {packageCount} gói
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      route.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {route.status === 'active' ? 'Hoạt động' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(route)}
                      className="rounded-2xl bg-[#f4f0e8] px-3.5 py-1.5 text-xs font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition border-none"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => toggleRouteStatus(route.id)}
                      className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition border-none ${
                        route.status === 'active'
                          ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {route.status === 'active' ? 'Ẩn' : 'Hiện'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Route Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] p-6 shadow-2xl animate-fade-in font-sans border-none">
            <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
              <h3 className="text-lg font-black text-[#102033]">
                {editingRoute ? 'Chỉnh sửa tuyến đường' : 'Thêm tuyến đường mới'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-[#fbfaf7] hover:bg-[#f6efe1] p-2 text-[#5f6b76] transition border-none focus:outline-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Điểm đi</label>
                  <input 
                    required
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Ví dụ: Huế, Đà Nẵng..." 
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5f6b76] uppercase">Điểm đến</label>
                  <input 
                    required
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Ví dụ: Hội An, Đà Nẵng..." 
                    className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Khoảng cách (km)</label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  placeholder="Ví dụ: 100" 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Thời gian di chuyển ước tính</label>
                <input 
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ví dụ: 2 giờ, 45 phút..." 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
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
