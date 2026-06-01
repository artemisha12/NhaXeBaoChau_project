import { pricePackages } from "@/lib/constants/mock-data";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function PackageTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-black text-slate-950">Gói giá</h2>
          <p className="text-sm text-slate-500">Gồm xe ghép theo chỗ và bao chuyến nguyên xe.</p>
        </div>
        <button className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400">+ Thêm gói giá</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-5 py-4">Tuyến</th>
              <th className="px-5 py-4">Xe</th>
              <th className="px-5 py-4">Loại</th>
              <th className="px-5 py-4">Giá</th>
              <th className="px-5 py-4">Mô tả</th>
              <th className="px-5 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pricePackages.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-950">{item.routeName}</td>
                <td className="px-5 py-4 text-slate-700">{item.vehicleName}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    {item.type === "shared-seat" ? "Xe ghép" : "Bao chuyến"}
                  </span>
                </td>
                <td className="px-5 py-4 font-black text-slate-950">{formatMoney(item.price)}</td>
                <td className="px-5 py-4 text-slate-600">{item.description}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Đang hiển thị</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
