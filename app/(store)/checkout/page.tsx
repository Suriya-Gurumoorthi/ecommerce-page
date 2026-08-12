import { redirect } from "next/navigation";
import { CheckoutPageClient } from "@/components/store/CheckoutPageClient";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-12">
      <CheckoutPageClient initialEmail={user.email ?? ""} initialName={String(user.user_metadata.full_name ?? "")} />
    </div>
  );
}
