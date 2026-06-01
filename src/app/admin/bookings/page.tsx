import AdminHeader from "@/components/admin/AdminHeader";
import BookingTable from "@/components/admin/BookingTable";

export default function BookingsPage() {
  return (
    <>
      <AdminHeader title="Quản lý đơn đặt vé" />
      <main className="p-5 sm:p-8">
        <BookingTable />
      </main>
    </>
  );
}
