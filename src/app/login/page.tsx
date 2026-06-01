"use client";

/**
 * Trang /login — Redirect sang /admin/login
 *
 * Trang này trước đây bypass authentication (cho vào dashboard mà không kiểm tra).
 * Đã sửa: redirect về trang login admin chính thức.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ngay sang admin login — trang login duy nhất hợp lệ
    router.replace("/admin/login");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-4 text-sm text-slate-400">
          Đang chuyển hướng đến trang đăng nhập...
        </p>
      </div>
    </main>
  );
}
