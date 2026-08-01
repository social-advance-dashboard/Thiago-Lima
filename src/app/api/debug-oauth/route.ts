export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  const redirectUri = appUrl
    ? `${appUrl}/api/integracoes/google/callback`
    : "NEXT_PUBLIC_APP_URL não definida";

  return Response.json({
    NEXT_PUBLIC_APP_URL: appUrl ?? "INDEFINIDA",
    GOOGLE_CLIENT_ID: clientId ? `${clientId.slice(0, 20)}...` : "INDEFINIDO",
    GOOGLE_CLIENT_SECRET: hasClientSecret ? "definida" : "INDEFINIDA",
    SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey ? "definida" : "INDEFINIDA",
    redirect_uri_que_seria_enviada: redirectUri,
  });
}
