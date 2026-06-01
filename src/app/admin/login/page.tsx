'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isMounted } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (isMounted && isLoggedIn) {
      router.push('/admin/dashboard');
    }
  }, [isLoggedIn, isMounted, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || cooldown > 0) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await login(username, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setErrorMsg(res.error || 'Đăng nhập không thành công.');
        setCooldown(3);
      }
    } catch (err) {
      setErrorMsg('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.');
      setCooldown(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-slate-900 p-8 shadow-2xl border border-slate-800">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white overflow-hidden p-2 shadow-inner">
            <img src="/images/hero/logo.png" alt="Logo Bảo Châu Car" className="h-full object-contain" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white">
            Nhà Xe Bảo Châu
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Hệ thống quản trị nội bộ dành cho nhân viên
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 animate-pulse">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Tên đăng nhập</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || cooldown > 0}
              className="group relative flex w-full justify-center rounded-2xl bg-amber-500 px-4 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:bg-amber-500/50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
              ) : cooldown > 0 ? (
                `Thử lại sau ${cooldown}s...`
              ) : (
                'Đăng nhập hệ thống'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-amber-500 transition">
            &larr; Quay lại trang chủ website
          </Link>
        </div>
      </div>
    </div>
  );
}
