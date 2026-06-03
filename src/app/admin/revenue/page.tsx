import AdminHeader from "@/components/admin/AdminHeader";
import RevenueReport from "@/components/admin/RevenueReport";

export default function RevenuePage() {
  return (
    <>
      <AdminHeader title="Báo cáo doanh thu" />
      <main className="p-5 sm:p-8">
        <RevenueReport />
      </main>
    </>
  );
}
