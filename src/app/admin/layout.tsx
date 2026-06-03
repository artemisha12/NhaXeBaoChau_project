'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import Sidebar from '@/components/admin/AdminSidebar';
import "@/app/admin/admin.css";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isMounted, mobileSidebarOpen, setMobileSidebarOpen } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isMounted && !isLoggedIn && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoggedIn, isMounted, isLoginPage, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show loader when redirecting unauthorized users
  if (!isLoggedIn && !isLoginPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div 
      className="flex h-screen text-[#102033] font-sans overflow-hidden relative"
      style={{
        background: 'radial-gradient(circle at top left, rgba(229, 170, 53, 0.05), transparent 35%), linear-gradient(180deg, #fffdf8 0%, #f7f2e8 100%)'
      }}
    >
      {/* Desktop Sidebar (hidden on mobile, visible on desktop) */}
      <Sidebar />

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 z-45 transition-opacity duration-300 lg:hidden ${
          mobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Sidebar Container */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-72 bg-[#04101b] z-50 shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isMobile={true} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}
