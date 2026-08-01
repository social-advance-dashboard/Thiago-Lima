import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get("empresa_id");
  if (!empresaId) {
    return new Response("empresa_id obrigatório", { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integracoes/meta/callback`;

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "pages_show_list,pages_read_engagement,read_insights",
    state: empresaId,
  });

  return Response.redirect(
    `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  );
}
