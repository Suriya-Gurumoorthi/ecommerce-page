import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Profile } from "@/types";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Supabase's browser client reads the session from these cookies via
          // document.cookie, so they must stay readable by client JS
          // (httpOnly: false, the library default) — forcing httpOnly here
          // silently breaks every client-side Supabase call (auth state,
          // storage uploads) while leaving SSR unaffected, which is why the
          // failure was invisible server-side.
          response.cookies.set({ name, value, ...options, secure: process.env.NODE_ENV === "production" });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const protectedCustomerRoute = pathname === "/checkout" || pathname.startsWith("/downloads");

  if (!user && protectedCustomerRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!user) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ success: false, error: "UNAUTHORIZED" }, { status: 401 });
      }

      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const { data: profile } = await supabase.from("profiles").select("id,email,full_name,role,created_at,updated_at").eq("id", user.id).single<Profile>();

    if (profile?.role !== "admin") {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ success: false, error: "FORBIDDEN" }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/checkout", "/downloads/:path*"]
};
