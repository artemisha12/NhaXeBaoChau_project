import AdminHeader from "@/components/admin/AdminHeader";
import RouteTable from "@/components/admin/RouteTable";

export default function RoutesPage() {
  return (
    <>
      <AdminHeader title="Quản lý tuyến đường" />
      <main className="p-5 sm:p-8">
        <RouteTable />
      </main>
    </>
  );
}
