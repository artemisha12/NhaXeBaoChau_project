import AdminHeader from "@/components/admin/AdminHeader";
import DashboardCards from "@/components/admin/DashboardCards";
import TodayBookings from "@/components/admin/TodayBookings";
import TodaySchedule from "@/components/admin/TodaySchedule";
import RevenueChart from "@/components/admin/RevenueChart";

export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Tổng quan" />
      <main className="p-5 sm:p-8 space-y-8">
        {/* 1. Summary Cards */}
        <DashboardCards />

        {/* 2. Today's Orders (right) + Today's Trips (left) */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 min-w-0">
            <TodayBookings />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <TodaySchedule />
          </div>
        </div>

        {/* 3. Revenue Chart */}
        <RevenueChart />
      </main>
    </>
  );
}
