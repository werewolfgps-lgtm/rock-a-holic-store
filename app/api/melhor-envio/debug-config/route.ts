import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

  return NextResponse.json({
    clientIdConfigurado: Boolean(clientId),
    clientIdFinal: clientId ? clientId.slice(-6) : null,
    clientSecretConfigurado: Boolean(clientSecret),
    redirectUri: redirectUri || null,
  });
}