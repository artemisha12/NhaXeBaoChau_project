// Admin layout — tất cả trang /admin/* dùng layout này
// Middleware Next.js sẽ redirect về /admin/login nếu chưa đăng nhập
import Sidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
