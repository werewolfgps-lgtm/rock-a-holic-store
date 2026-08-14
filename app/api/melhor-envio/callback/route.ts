import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

  if (!code) {
    return NextResponse.json(
      {
        erro: "Código de autorização não recebido.",
      },
      { status: 400 }
    );
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        erro: "Credenciais do Melhor Envio não configuradas.",
      },
      { status: 500 }
    );
  }

  try {
    const resposta = await fetch(
      "https://sandbox.melhorenvio.com.br/oauth/token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }),
      }
    );

    const dados = await resposta.json();

if (!resposta.ok) {
  console.error("Erro Melhor Envio:", dados);

  return NextResponse.json(
    {
      erro: "Não foi possível obter o token.",
    },
    { status: resposta.status }
  );
}

    return NextResponse.json({
      sucesso: true,
      mensagem: "Melhor Envio conectado com sucesso.",
      expires_in: dados.expires_in,
    });
  } catch {
    return NextResponse.json(
      {
        erro: "Erro ao comunicar com o Melhor Envio.",
      },
      { status: 500 }
    );
  }
}