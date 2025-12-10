import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // DEBUG: Cookies anzeigen mit Wert-Preview
  const allCookies = request.cookies.getAll();
  const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));
  
  if (supabaseCookies.length > 0) {
    supabaseCookies.forEach(c => {
      // Zeige nur ersten 50 chars des Werts
      const preview = c.value.substring(0, 50) + (c.value.length > 50 ? '...' : '');
      console.log(`🍪 ${c.name}: ${preview}`);
    });
  } else {
    console.log('🍪 Supabase Cookies: ❌ KEINE');
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verwende getSession() da es lokale Tokens prüft (schneller und zuverlässiger mit @supabase/ssr 0.1.0)
  const { data: { session }, error: authError } = await supabase.auth.getSession();

  if (authError) {
    console.log('⚠️ Auth Error:', authError.message);
  }
  
  const user = session?.user;
  console.log('👤 User:', user ? `✅ ${user.email}` : '❌ None', '| Path:', request.nextUrl.pathname);

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      console.log('🚫 No session, redirecting to /auth/login');
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    console.log('✅ User authenticated, allowing access to /admin');
  }

  // Allow public widget routes
  if (
    request.nextUrl.pathname.startsWith("/widget") ||
    request.nextUrl.pathname.startsWith("/api/widget")
  ) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

