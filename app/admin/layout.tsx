import { Bell } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { requireAdminPage } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminPage();

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-admin-surface text-gray-900">
      <AdminSidebar />
      <div>
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <Breadcrumbs items={["Admin"]} />
          <div className="flex items-center gap-4">
            <Bell size={18} />
            <span className="text-sm font-medium">{profile.full_name ?? profile.email}</span>
            <LogoutButton className="text-sm text-gray-500 hover:text-gray-900" />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
