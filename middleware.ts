
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: any;
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookies: CookieToSet[]) {
          cookies.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          cookiesToSet.push(...cookies);

          response = NextResponse.next({ request });

          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const protectedPaths = [
    "/dashboard",
    "/wallet",
    "/profile",
    "/settings",
    "/transactions",
    "/invest",
    "/referrals",
    "/notifications",
    "/support",
    "/deposit",
    "/withdraw",
    "/tasks",
    "/admin",
  ];

  const requiresLogin = protectedPaths.some(
    (path) =>
      pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!user && requiresLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(loginUrl);

    cookiesToSet.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    return redirectResponse;
  }

  response.headers.set("X-DNS-Prefetch-Control", "on");

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
