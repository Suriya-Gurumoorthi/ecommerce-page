import { Suspense } from "react";
import { LoginForm } from "@/components/store/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-24">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
