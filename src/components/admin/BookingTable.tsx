import StatusBadge from "@/components/common/StatusBadge";
import { bookings } from "@/lib/constants/mock-data";

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function BookingTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Danh sách đơn đặt vé</h2>
          <p className="text-sm text-slate-500">Giao diện mẫu: lọc, tìm kiếm và cập nhật trạng thái sẽ nối backend sau.</p>
        </div>
        <div className="flex gap-3">
          <input className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-500" placeholder="Tìm tên hoặc SĐT" />
          <select className="rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-amber-500">
            <option>Tất cả trạng thái</option>
            <option>Mới gửi</option>
            <option>Đã xác nhận</option>
            <option>Hoàn thành</option>
            <option>Đã huỷ</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-950 text-white">
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
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-bold text-slate-950">{booking.code}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{booking.customerName}</p>
                  <p className="text-slate-500">{booking.phone}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">{booking.routeName}</td>
                <td className="px-5 py-4 text-slate-700">{booking.travelDate}</td>
                <td className="px-5 py-4 text-slate-700">{booking.passengerCount}</td>
                <td className="px-5 py-4 font-bold text-slate-950">{formatMoney(booking.totalPrice)}</td>
                <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                <td className="px-5 py-4">
                  <button className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
