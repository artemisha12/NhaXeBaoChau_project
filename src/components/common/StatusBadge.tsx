import type { BookingStatus } from "@/lib/types";

const statusMap: Record<BookingStatus, { label: string; className: string }> = {
  new: {
    label: "Mới gửi",
    className: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-sky-100 text-sky-800 ring-sky-200",
  },
  cancelled: {
    label: "Đã huỷ",
    className: "bg-rose-100 text-rose-800 ring-rose-200",
  },
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  const item = statusMap[status];
  return (
    <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ring-1 ${item.className}`}>
      {item.label}
    </span>
  );
}
