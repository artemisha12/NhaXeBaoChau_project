'use client';

import { useAdmin } from "@/context/AdminContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminHeader({ title }: { title: string }) {
  const { adminUser, logout, setMobileSidebarOpen } = useAdmin();
  const router = useRouter();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push('/admin/login');
  };

  return (
    <header className="border-b border-[#e8dccb] bg-[#fffdf8] px-5 py-4 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button (visible on mobile only) */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="rounded-2xl border border-[#e8dccb] p-2.5 hover:bg-[#f6efe1] lg:hidden text-slate-700 focus:outline-none transition"
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          
          <div>
            <p className="text-xs font-semibold text-slate-400">Trang quản trị</p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {adminUser && (
            <span className="hidden sm:inline-flex items-center text-sm font-semibold text-[#5f6b76] bg-[#fbfaf7] px-3.5 py-2 rounded-xl border border-[#e8dccb] gap-1.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {adminUser}
            </span>
          )}
          <Link 
            href="/" 
            className="rounded-2xl border border-[#e8dccb] px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-[#5f6b76] hover:border-[#c88925] hover:text-[#c88925] transition flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="hidden sm:inline">Xem website</span>
          </Link>
          <button 
            onClick={handleLogout} 
            className="rounded-2xl bg-[#04101b] px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#123047] transition focus:outline-none flex items-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
