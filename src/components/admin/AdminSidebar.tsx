'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/admin/bookings",
    label: "Đơn đặt vé",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
        <line x1="13" y1="5" x2="13" y2="7" />
        <line x1="13" y1="17" x2="13" y2="19" />
        <line x1="13" y1="11" x2="13" y2="13" />
      </svg>
    ),
  },
  {
    href: "/admin/vehicles",
    label: "Quản lý xe",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    href: "/admin/routes",
    label: "Tuyến đường",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="5" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      </svg>
    ),
  },
  {
    href: "/admin/packages",
    label: "Gói giá",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Cài đặt website",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface AdminSidebarProps {
  isMobile?: boolean;
}

export default function AdminSidebar({ isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, setMobileSidebarOpen, adminUser } = useAdmin();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push('/admin/login');
  };

  const handleLinkClick = () => {
    if (isMobile) setMobileSidebarOpen(false);
  };

  const asideClasses = isMobile
    ? "flex h-full w-full flex-col bg-[#04101b] px-4 py-5 border-r border-white/5 text-white"
    : "hidden min-h-screen w-68 border-r border-white/5 bg-[#04101b] px-4 py-5 lg:flex lg:flex-col text-white";

  const initials = adminUser
    ? adminUser.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <aside className={asideClasses}>

      {/* Logo */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-xl bg-white overflow-hidden p-1 flex items-center justify-center shrink-0 shadow-md">
            <img src="/images/hero/logo.png" alt="Bảo Châu" className="h-full object-contain" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Bảo Châu</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Admin</p>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            aria-label="Đóng menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Label nhóm */}
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        Điều hướng
      </p>

      {/* Menu items */}
      <nav className="flex-1 space-y-0.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className={`shrink-0 ${isActive ? 'text-white' : 'text-white'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="mt-4 border-t border-white/8 pt-4 space-y-1">
        {/* Admin user */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-amber-400">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{adminUser || 'Admin'}</p>
            <p className="text-[10px] text-slate-500 font-medium">Quản trị viên</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-150 focus:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
