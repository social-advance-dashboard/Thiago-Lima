import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const empresaId = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code || !empresaId) {
    return Response.redirect(`${appUrl}/empresas?erro=meta_oauth_falhou`);
  }

  const redirectUri = `${appUrl}/api/integracoes/meta/callback`;

  // Troca code por token de curta duração
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: redirectUri,
        code,
      })
  );
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return Response.redirect(`${appUrl}/empresas/${empresaId}?erro=meta_token_falhou`);
  }

  // Troca por token de longa duração (60 dias)
  const longTokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: tokenData.access_token,
      })
  );
  const longToken = await longTokenRes.json();
  const accessToken = longToken.access_token ?? tokenData.access_token;

  // Busca nome do usuário conectado
  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=name,email&access_token=${accessToken}`
  );
  const me = await meRes.json();

  const supabase = createAdminClient();

  await supabase.from("integracoes_ads").upsert(
    {
      empresa_id: empresaId,
      provider: "meta_ads",
      status: "ativo",
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: longToken.expires_in
        ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
        : null,
      account_name: me.name ?? me.email ?? null,
    },
    { onConflict: "empresa_id,provider" }
  );

  return Response.redirect(`${appUrl}/empresas/${empresaId}?meta_conectado=1`);
}
