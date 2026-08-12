"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoginSchema } from "@/lib/validations/schemas";
import type { Profile } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    const parsed = LoginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setError("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword(parsed.data);

    if (signInError || !data.user) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("id,email,full_name,role,created_at,updated_at").eq("id", data.user.id).single<Profile>();
    router.push(profile?.role === "admin" ? "/admin" : redirectTo);
    router.refresh();
  }

  async function google() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}` }
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="font-display text-3xl font-bold">Login</h1>
      <div className="mt-6 space-y-4 rounded-2xl border border-store-border bg-store-surface p-6">
        <input aria-label="Email" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input aria-label="Password" className="w-full rounded-lg border border-store-border bg-store-bg px-3 py-3 transition placeholder:text-store-muted focus:border-store-gold focus:outline-none focus:ring-2 focus:ring-store-gold/30" placeholder="Password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button disabled={loading} onClick={submit} className="w-full rounded-full bg-store-gold px-5 py-3 font-bold text-store-bg disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button onClick={google} className="w-full rounded-full border border-store-border px-5 py-3 font-bold transition hover:border-store-gold/60">Continue with Google</button>
        <p className="text-sm text-store-muted">
          New here? <Link href="/register" className="font-medium text-store-gold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
