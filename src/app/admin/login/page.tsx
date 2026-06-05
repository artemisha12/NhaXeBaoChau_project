'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isMounted } = useAdmin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMounted && isLoggedIn) router.push('/admin/dashboard');
  }, [isLoggedIn, isMounted, router]);

  useEffect(() => {
    if (isMounted && !isLoggedIn) usernameRef.current?.focus();
  }, [isMounted, isLoggedIn]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04101b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || cooldown > 0) return;

    if (!username.trim()) { setErrorMsg('Vui lòng nhập tên đăng nhập.'); return; }
    if (!password) { setErrorMsg('Vui lòng nhập mật khẩu.'); return; }

    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await login(username.trim(), password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setErrorMsg(res.error || 'Đăng nhập không thành công.');
        setCooldown(3);
        setPassword('');
      }
    } catch {
      setErrorMsg('Lỗi kết nối. Vui lòng thử lại.');
      setCooldown(5);
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = submitting || cooldown > 0;

  return (
    <div
      className="flex min-h-screen items-center justify-center font-sans px-4"
      style={{ background: 'linear-gradient(135deg, #04101b 0%, #0a1d2c 50%, #04101b 100%)' }}
    >
      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Logo + brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0d1a28] border border-amber-500/20 shadow-lg mb-4 overflow-hidden">
            <img
              src="/images/hero/logo_navbar_nobg.png"
              alt="Bảo Châu"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nhà Xe Bảo Châu</h1>
          <p className="text-sm text-slate-400 mt-1">Hệ thống quản trị nội bộ</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-[#0d1a28]/80 border border-white/8 backdrop-blur-sm p-7 shadow-2xl">

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 px-4 py-3 text-sm text-rose-400">
              <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-amber-500/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-amber-500/60 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30"
                />
                {/* Toggle show/hide */}
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={disabled}
              className="mt-2 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed"
              style={{
                background: disabled ? 'rgba(200,137,37,0.4)' : 'linear-gradient(135deg, #e6a930, #c88925)',
                color: disabled ? 'rgba(255,255,255,0.5)' : '#0d1a28',
                boxShadow: disabled ? 'none' : '0 4px 16px rgba(200,137,37,0.35)',
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xác thực...
                </span>
              ) : cooldown > 0 ? (
                `Thử lại sau ${cooldown}s`
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="mt-6 text-center text-xs text-slate-600">
          <Link href="/" className="hover:text-amber-500 transition-colors">
            ← Quay lại trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
