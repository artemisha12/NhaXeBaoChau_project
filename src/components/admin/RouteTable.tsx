import { routes } from "@/lib/constants/mock-data";

export default function RouteTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Tuyến đường đang vận hành</h2>
          <p className="text-sm text-slate-500">Dùng để tạo gói giá và hiển thị ngoài bảng giá.</p>
        </div>
        <button className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400">+ Thêm tuyến</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-white">
          <tr>
            <th className="px-5 py-4">Điểm đi</th>
            <th className="px-5 py-4">Điểm đến</th>
            <th className="px-5 py-4">Quãng đường</th>
            <th className="px-5 py-4">Thời gian</th>
            <th className="px-5 py-4">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {routes.map((route) => (
            <tr key={route.id} className="hover:bg-slate-50">
              <td className="px-5 py-4 font-bold text-slate-950">{route.from}</td>
              <td className="px-5 py-4 text-slate-700">{route.to}</td>
              <td className="px-5 py-4 text-slate-700">{route.distanceKm} km</td>
              <td className="px-5 py-4 text-slate-700">{route.duration}</td>
              <td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Đang chạy</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
