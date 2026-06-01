export default function SettingsForm() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">Cài đặt thông tin website</h2>
      <p className="mt-1 text-sm text-slate-500">Frontend mẫu cho hotline, Zalo, địa chỉ, giờ làm việc và slogan.</p>

      <form className="mt-6 grid gap-5 md:grid-cols-2">
        <label>
          <span className="text-sm font-bold text-slate-700">Hotline</span>
          <input defaultValue="0905 123 456" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-700">Zalo hỗ trợ</span>
          <input defaultValue="0905 123 456" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Địa chỉ văn phòng</span>
          <input defaultValue="Huế - Đà Nẵng - Hội An" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-700">Giờ làm việc</span>
          <input defaultValue="06:00 - 22:00" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label>
          <span className="text-sm font-bold text-slate-700">Facebook / Zalo OA</span>
          <input defaultValue="https://facebook.com/nhaxebaochau" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold text-slate-700">Slogan banner</span>
          <textarea rows={4} defaultValue="An toàn - Tiện lợi - Đúng giờ trên mọi hành trình." className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <div className="md:col-span-2">
          <button type="button" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">
            Lưu thay đổi giao diện
          </button>
        </div>
      </form>
    </div>
  );
}
