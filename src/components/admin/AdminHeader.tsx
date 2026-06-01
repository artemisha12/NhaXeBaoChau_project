export default function AdminHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Trang quản trị</p>
          <h1 className="text-2xl font-black text-slate-950">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-amber-400">
            Xem website
          </a>
          <a href="/login" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Đăng xuất
          </a>
        </div>
      </div>
    </header>
  );
}
