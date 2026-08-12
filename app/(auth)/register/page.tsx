import { Suspense } from "react";
import { RegisterForm } from "@/components/store/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-24">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
