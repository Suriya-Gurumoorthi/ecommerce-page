import { DataTable } from "@/components/admin/DataTable";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Profile } from "@/types";

export default async function CustomersPage() {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,role,created_at,updated_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Customers</h1>
      <DataTable
        rows={data ?? []}
        empty="No customers"
        columns={[
          { key: "name", header: "Name", render: (row) => row.full_name ?? "—" },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "joined", header: "Joined", render: (row) => new Date(row.created_at).toLocaleDateString("en-IN") },
          { key: "actions", header: "Actions", render: () => "View orders" }
        ]}
      />
    </div>
  );
}
