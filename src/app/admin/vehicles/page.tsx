import AdminHeader from "@/components/admin/AdminHeader";
import VehicleTable from "@/components/admin/VehicleTable";

export default function VehiclesPage() {
  return (
    <>
      <AdminHeader title="Quản lý xe" />
      <main className="p-5 sm:p-8">
        <VehicleTable />
      </main>
    </>
  );
}
