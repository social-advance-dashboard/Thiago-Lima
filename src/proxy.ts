import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const rotaPublica =
    pathname.startsWith("/login") ||
    pathname.startsWith("/relatorios") ||
    pathname.startsWith("/auth");

  if (!user && !rotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Usuários de empresa: redireciona para o portal em QUALQUER rota fora de /portal
  // (inclui /relatorios e outras rotas "públicas" que expõem dados da agência)
  if (user) {
    const isEmpresaUser = user.app_metadata?.role === "empresa";
    const isPortalRoute = pathname.startsWith("/portal");
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/auth");

    if (isEmpresaUser && !isPortalRoute && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal/financeiro";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
