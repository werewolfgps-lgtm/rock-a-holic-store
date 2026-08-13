import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        erro: "Credenciais do Melhor Envio não configuradas.",
      },
      { status: 500 }
    );
  }

  const authorizationUrl = new URL(
    "https://sandbox.melhorenvio.com.br/oauth/authorize"
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");

  authorizationUrl.searchParams.set(
    "scope",
    [
      "shipping-calculate",
      "shipping-companies",
      "cart-read",
      "cart-write",
      "orders-read",
      "shipping-checkout",
      "shipping-generate",
      "shipping-print",
      "shipping-tracking",
      "users-read",
    ].join(" ")
  );

  return NextResponse.redirect(authorizationUrl);
}