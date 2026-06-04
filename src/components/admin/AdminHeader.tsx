'use client';

import { useAdmin } from "@/context/AdminContext";
import Link from "next/link";

export default function AdminHeader({ title }: { title: string }) {
  const { adminUser, setMobileSidebarOpen } = useAdmin();

  return (
    <header className="sticky top-0 z-30 border-b border-amber-100/80 bg-[#fdf8f0]/95 backdrop-blur-sm px-4 sm:px-6 py-3 min-h-[56px] flex items-center">
      <div className="flex items-center justify-between gap-4 w-full">

        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition"
            aria-label="Mở menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Trang quản trị
            </p>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {adminUser && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {adminUser}
            </span>
          )}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-amber-400 hover:text-amber-600 transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">Xem website</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
