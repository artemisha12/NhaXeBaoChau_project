const cards = [
  { label: "Đơn mới hôm nay", value: "08", note: "Chưa xử lý", icon: "🟡" },
  { label: "Đơn chờ xác nhận", value: "15", note: "Cần gọi khách", icon: "☎️" },
  { label: "Đơn trong tháng", value: "126", note: "Tổng yêu cầu", icon: "📅" },
  { label: "Xe đang hoạt động", value: "12", note: "Hiển thị ngoài website", icon: "🚘" },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <p className="mt-3 text-4xl font-black text-slate-950">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{card.note}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
