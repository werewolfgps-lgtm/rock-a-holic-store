import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
const secretHash = clientSecret
  ? crypto
      .createHash("sha256")
      .update(clientSecret)
      .digest("hex")
      .slice(0, 10)
  : null;

  return NextResponse.json({
    clientSecretHash: secretHash,
    clientIdConfigurado: Boolean(clientId),
    clientIdFinal: clientId ? clientId.slice(-6) : null,
    clientSecretConfigurado: Boolean(clientSecret),
    redirectUri: redirectUri || null,
  });
}