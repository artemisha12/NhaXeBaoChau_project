"use client";

import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/admin/dashboard";
    }, 500);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-xl font-black text-amber-400">BC</div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">Đăng nhập Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Giao diện frontend mẫu, chưa kiểm tra tài khoản thật.</p>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Tên đăng nhập</span>
            <input required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="admin" />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Mật khẩu</span>
            <input required type="password" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="••••••••" />
          </label>
        </div>

        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-amber-500 px-6 py-4 font-black text-slate-950 hover:bg-amber-400 disabled:opacity-70">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <a href="/" className="mt-5 block text-center text-sm font-semibold text-slate-500 hover:text-amber-700">
          Quay lại trang khách hàng
        </a>
      </form>
    </main>
  );
}
