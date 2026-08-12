import * as Sentry from "@sentry/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Profile } from "@/types";

const memoryHits = new Map<string, { count: number; resetAt: number }>();

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function fail(error: string, status: number, message?: string, fields?: Record<string, string[]>) {
  return NextResponse.json<ApiResponse<never>>({ success: false, error, message, fields }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const fields = Object.fromEntries(
      Object.entries(error.flatten().fieldErrors).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))
    );
    return fail("VALIDATION_ERROR", 400, "Invalid request payload", fields);
  }

  Sentry.captureException(error);
  return fail("INTERNAL_ERROR", 500);
}

export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAdminProfile(): Promise<Profile | null> {
  const user = await requireUser();

  if (!user) {
    return null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at,updated_at")
    .eq("id", user.id)
    .single<Profile>();

  return data?.role === "admin" ? data : null;
}

export function requireCron(request: NextRequest) {
  return request.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function rateLimit(request: NextRequest, namespace: string, limit = 10) {
  const forwarded = request.headers.get("x-forwarded-for");
  const identifier = `${namespace}:${forwarded?.split(",")[0] ?? "anonymous"}`;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, "1 m")
    });
    const result = await ratelimit.limit(identifier);
    return result.success;
  }

  const now = Date.now();
  const windowMs = 60_000;
  const current = memoryHits.get(identifier);

  if (!current || current.resetAt < now) {
    memoryHits.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= limit;
}
