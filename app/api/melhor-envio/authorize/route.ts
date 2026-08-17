import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { erro: "Credenciais do Melhor Envio não configuradas." },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(32).toString("hex");

  const authUrl = new URL(
    "https://sandbox.melhorenvio.com.br/oauth/authorize"
  );

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "shipping-calculate shipping-checkout shipping-generate shipping-print shipping-tracking cart-read cart-write"
  );
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set("melhor_envio_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}