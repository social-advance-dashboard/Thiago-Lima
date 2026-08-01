import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresa_id");
  if (!empresaId) {
    return new Response("empresa_id obrigatório", { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integracoes/google/callback`;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state: empresaId,
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
