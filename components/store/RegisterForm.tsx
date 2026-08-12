"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RegisterSchema } from "@/lib/validations/schemas";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    const parsed = RegisterSchema.safeParse({ fullName, email, password, confirmPassword });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your registration details.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await createClient().auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { full_name: parsed.data.fullName } }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="font-display text-3xl font-bold">Create account</h1>
      <div className="mt-6 space-y-4 rounded-2xl border border-store-border bg-store-surface p-6">
        <input aria-label="Full name" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Full name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <input aria-label="Email" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input aria-label="Password" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <input aria-label="Confirm password" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button disabled={loading} onClick={submit} className="w-full rounded-full bg-store-gold px-5 py-3 font-bold text-store-bg disabled:opacity-50">
          {loading ? "Creating..." : "Register"}
        </button>
      </div>
    </div>
  );
}
