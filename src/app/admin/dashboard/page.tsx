import AdminHeader from "@/components/admin/AdminHeader";
import DashboardCards from "@/components/admin/DashboardCards";
import PendingBookings from "@/components/admin/PendingBookings";
import TodaySchedule from "@/components/admin/TodaySchedule";

export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Tổng quan" />
      <main className="p-5 sm:p-8 space-y-8">
        <DashboardCards />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PendingBookings />
          </div>
          <div>
            <TodaySchedule />
          </div>
        </div>
      </main>
    </>
  );
}

