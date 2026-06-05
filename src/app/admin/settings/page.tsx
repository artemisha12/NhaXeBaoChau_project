import AdminHeader from "@/components/admin/AdminHeader";
import SettingsForm from "@/components/admin/SettingsForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default function SettingsPage() {
  return (
    <>
      <AdminHeader title="Cài đặt" />
      <main className="p-5 sm:p-8 space-y-6">
        <SettingsForm />
        <ChangePasswordForm />
      </main>
    </>
  );
}
