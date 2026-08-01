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
    return Response.redirect(
      `${appUrl}/empresas/${empresaId}?erro_meta=${encodeURIComponent(
        tokenData.error?.message ?? "token_falhou"
      )}`
    );
  }

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

  const meRes = await fetch(
    `https://graph.facebook.com/v19.0/me?fields=name,email&access_token=${accessToken}`
  );
  const me = await meRes.json();
  const accountName = me.name ?? me.email ?? "Meta";

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("integracoes_ads")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("provider", "meta_ads")
    .maybeSingle();

  let saveError: string | null = null;

  if (existing) {
    const { error } = await supabase
      .from("integracoes_ads")
      .update({
        status: "ativo",
        access_token: accessToken,
        refresh_token: null,
        token_expires_at: longToken.expires_in
          ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
          : null,
        account_name: accountName,
      })
      .eq("id", existing.id);
    if (error) saveError = error.message;
  } else {
    const { error } = await supabase.from("integracoes_ads").insert({
      empresa_id: empresaId,
      provider: "meta_ads",
      status: "ativo",
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: longToken.expires_in
        ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
        : null,
      account_name: accountName,
    });
    if (error) saveError = error.message;
  }

  if (saveError) {
    return Response.redirect(
      `${appUrl}/empresas/${empresaId}?erro_meta=${encodeURIComponent(saveError)}`
    );
  }

  return Response.redirect(`${appUrl}/empresas/${empresaId}?meta_conectado=1`);
}
