import { vehicles } from "@/lib/constants/mock-data";

export default function VehicleTable() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">Danh sách xe</h2>
          <p className="text-sm text-slate-500">Thêm, sửa, ẩn xe sẽ xử lý bằng backend sau.</p>
        </div>
        <button className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400">+ Thêm xe</button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="grid h-28 place-items-center rounded-2xl bg-slate-950 text-4xl">🚘</div>
            <h3 className="mt-4 text-lg font-black text-slate-950">{vehicle.name}</h3>
            <p className="text-sm font-semibold text-amber-700">{vehicle.type}</p>
            <p className="mt-3 text-sm text-slate-600">{vehicle.description}</p>
            <div className="mt-4 flex justify-between text-sm">
              <span>{vehicle.seats} chỗ</span>
              <span className="font-bold">{vehicle.plateNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
