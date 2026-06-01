import AdminHeader from "@/components/admin/AdminHeader";
import PackageTable from "@/components/admin/PackageTable";

export default function PackagesPage() {
  return (
    <>
      <AdminHeader title="Quản lý gói giá" />
      <main className="p-5 sm:p-8">
        <PackageTable />
      </main>
    </>
  );
}
