import AdminHeader from "@/components/admin/AdminHeader";
import DashboardCards from "@/components/admin/DashboardCards";
import BookingTable from "@/components/admin/BookingTable";

export default function DashboardPage() {
  return (
    <>
      <AdminHeader title="Tổng quan" />
      <main className="p-5 sm:p-8">
        <DashboardCards />
        <div className="mt-8">
          <BookingTable />
        </div>
      </main>
    </>
  );
}
