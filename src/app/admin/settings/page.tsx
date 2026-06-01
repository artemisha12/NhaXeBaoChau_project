import AdminHeader from "@/components/admin/AdminHeader";
import SettingsForm from "@/components/admin/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <AdminHeader title="Cài đặt thông tin website" />
      <main className="p-5 sm:p-8">
        <SettingsForm />
      </main>
    </>
  );
}
