'use client';

import { useState } from 'react';
import { useAdmin } from "@/context/AdminContext";
import type { PricePackage, PackageType } from "@/lib/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function PackageTable() {
  const { 
    packages, 
    vehicles, 
    routes, 
    addPackage, 
    updatePackage, 
    togglePackageStatus 
  } = useAdmin();

  // Active elements for dropdowns
  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const activeRoutes = routes.filter(r => r.status === 'active');

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PricePackage | null>(null);

  // Filter states
  const [routeFilter, setRouteFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form states
  const [selectedVehicleName, setSelectedVehicleName] = useState('');
  const [selectedRouteName, setSelectedRouteName] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('shared-seat');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setSelectedVehicleName(activeVehicles[0]?.name || '');
    setSelectedRouteName(activeRoutes[0] ? `${activeRoutes[0].from} → ${activeRoutes[0].to}` : '');
    setPackageType('shared-seat');
    setPrice(200000);
    setDescription('Đưa đón tận nơi, xe đời mới.');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleOpenEdit = (pkg: PricePackage) => {
    setEditingPackage(pkg);
    setSelectedVehicleName(pkg.vehicleName);
    setSelectedRouteName(pkg.routeName);
    setPackageType(pkg.type);
    setPrice(pkg.price);
    setDescription(pkg.description);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleName || !selectedRouteName || price <= 0) return;

    setSaving(true);
    setErrorMsg('');
    const result = editingPackage
      ? await updatePackage(editingPackage.id, {
          vehicleName: selectedVehicleName,
          routeName: selectedRouteName,
          type: packageType,
          price,
          description,
          status: editingPackage.status
        })
      : await addPackage({
          vehicleName: selectedVehicleName,
          routeName: selectedRouteName,
          type: packageType,
          price,
          description
        });
    setSaving(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      setErrorMsg(result.error || 'Đã xảy ra lỗi.');
    }
  };

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    await togglePackageStatus(id);
    setTogglingId(null);
  };

  // Filtered packages logic
  const filteredPackages = packages.filter((item) => {
    const matchesRoute = routeFilter === 'all' || item.routeName === routeFilter;
    const matchesVehicle = vehicleFilter === 'all' || item.vehicleName === vehicleFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesRoute && matchesVehicle && matchesType;
  });

  return (
    <div className="overflow-hidden rounded-3xl bg-[#fffdf8] shadow-[0_8px_30px_rgb(0,0,0,0.02)] font-sans border-none">
      <div className="flex items-center justify-between border-b border-[#e8dccb]/30 p-5">
        <div>
          <h2 className="text-lg font-black text-[#102033]">Bảng gói cước &amp; Giá dịch vụ</h2>
          <p className="text-sm text-[#5f6b76]">Kết nối các dòng xe cùng với tuyến đường để tạo gói cước.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition duration-150 border-none"
        >
          + Thêm gói giá
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 bg-[#fbfaf7] border-b border-[#e8dccb]/20 p-5">
        {/* Route filter */}
        <select 
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả tuyến đường</option>
          {routes.map(r => {
            const rName = `${r.from} → ${r.to}`;
            return (
              <option key={r.id} value={rName}>{rName}</option>
            );
          })}
        </select>

        {/* Vehicle filter */}
        <select 
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả dòng xe</option>
          {Array.from(new Set(vehicles.map(v => v.name))).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        {/* Type filter */}
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
        >
          <option value="all">Tất cả hình thức</option>
          <option value="shared-seat">Xe ghép theo chỗ</option>
          <option value="private-trip">Bao nguyên xe</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#123047] text-white">
            <tr>
              <th className="px-5 py-4">Tuyến đường</th>
              <th className="px-5 py-4">Dòng xe sử dụng</th>
              <th className="px-5 py-4">Hình thức đi</th>
              <th className="px-5 py-4">Đơn giá</th>
              <th className="px-5 py-4">Mô tả cước</th>
              <th className="px-5 py-4">Trạng thái</th>
              <th className="px-5 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8dccb]/30">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-[#f6efe1]/30 transition duration-150 ${
                    item.status === 'hidden' ? 'opacity-50 bg-[#fbfaf7]/65' : ''
                  }`}
                >
                  <td className="px-5 py-4 font-bold text-[#102033]">{item.routeName}</td>
                  <td className="px-5 py-4 text-[#102033] font-semibold">{item.vehicleName}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      item.type === "shared-seat" 
                        ? "bg-[#fff8e8] text-[#805112]" 
                        : "bg-[#eafafa] text-[#073f49]"
                    }`}>
                      {item.type === "shared-seat" ? "Xe ghép theo chỗ" : "Bao nguyên xe"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-black text-[#102033]">{formatMoney(item.price)}</td>
                  <td className="px-5 py-4 text-[#5f6b76] text-xs font-semibold">{item.description}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      item.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status === 'active' ? 'Đang hiển thị' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="rounded-2xl bg-[#f4f0e8] px-3.5 py-1.5 text-xs font-bold text-[#5f6b76] hover:bg-[#e7dfd2] transition border-none"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggle(item.id)}
                      disabled={togglingId === item.id}
                      className={`rounded-2xl px-3.5 py-1.5 text-xs font-bold transition border-none ${
                        item.status === 'active'
                          ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {item.status === 'active' ? 'Ẩn gói' : 'Hiện gói'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#5f6b76] font-bold">
                  Không tìm thấy gói cước nào khớp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Package Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04101b]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#fffdf8] p-6 shadow-2xl animate-fade-in font-sans border-none">
            <div className="flex items-center justify-between border-b border-[#e8dccb]/30 pb-4">
              <h3 className="text-lg font-black text-[#102033]">
                {editingPackage ? 'Cập nhật gói giá cước' : 'Thêm gói giá cước mới'}
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
              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Chọn tuyến đường</label>
                <select 
                  value={selectedRouteName}
                  onChange={(e) => setSelectedRouteName(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  <option value="">-- Chọn tuyến --</option>
                  {activeRoutes.map(r => (
                    <option key={r.id} value={`${r.from} → ${r.to}`}>{r.from} &rarr; {r.to}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Chọn dòng xe vận hành</label>
                <select 
                  value={selectedVehicleName}
                  onChange={(e) => setSelectedVehicleName(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  <option value="">-- Chọn xe --</option>
                  {activeVehicles.map(v => (
                    <option key={v.id} value={v.name}>{v.name} ({v.seats} chỗ)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Hình thức chuyến</label>
                <select 
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as PackageType)}
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925]"
                >
                  <option value="shared-seat">Xe ghép (Tính cước theo từng chỗ)</option>
                  <option value="private-trip">Bao chuyến nguyên xe (Tính cước trọn chuyến)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Giá cước (VNĐ)</label>
                <input 
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Ví dụ: 200000" 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] px-4 py-2.5 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5f6b76] uppercase">Mô tả hiển thị</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cho hành khách dễ hiểu (ví dụ: đón trả tận nơi, bao xe 4 chỗ riêng tư...)" 
                  className="mt-1.5 w-full rounded-2xl border border-[#e8dccb]/60 bg-[#fffdf8] text-[#102033] p-3 text-sm outline-none focus:border-[#c88925] focus:ring-1 focus:ring-[#c88925]"
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
                  disabled={saving}
                  className="rounded-2xl bg-[#c88925] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a86e19] transition border-none disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
