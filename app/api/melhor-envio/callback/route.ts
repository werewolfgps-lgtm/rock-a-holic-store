import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const stateRecebido = request.nextUrl.searchParams.get("state");
  const stateSalvo = request.cookies.get("melhor_envio_oauth_state")?.value;

  if (!stateRecebido || !stateSalvo || stateRecebido !== stateSalvo) {
    return NextResponse.json(
      { erro: "Falha na validação de segurança da autorização." },
      { status: 400 }
    );
  }

  const code = request.nextUrl.searchParams.get("code");

const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;

console.log("OAuth code recebido:", {
  existeCode: Boolean(code),
  tamanhoCode: code?.length || 0,
  stateRecebido: Boolean(stateRecebido),
});

return NextResponse.json({
  diagnostico: true,
  codeRecebido: Boolean(code),
  tamanhoCode: code?.length || 0,
  stateRecebido: Boolean(stateRecebido),
  stateSalvo: Boolean(stateSalvo),
  stateValido:
    Boolean(stateRecebido) &&
    Boolean(stateSalvo) &&
    stateRecebido === stateSalvo,
  clientIdFinal: clientId?.slice(-6),
  clientSecretConfigurado: Boolean(clientSecret),
  redirectUri,
});
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
console.log("OAuth callback config", {
  clientIdFinal: clientId?.slice(-6),
  redirectUri,
  temClientSecret: Boolean(clientSecret),
});

console.log("OAuth token request:", {
  grantType: "authorization_code",
  clientIdFinal: clientId?.slice(-6),
  redirectUri,
  existeCode: Boolean(code),
  tamanhoCode: code?.length || 0,
  temClientSecret: Boolean(clientSecret),
});

  try {
    const resposta = await fetch(
      "https://sandbox.melhorenvio.com.br/oauth/token",
      {
        method: "POST",
        headers: {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Rock-a-Holic Store (edsonrodrigues400@hotmail.com)",
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

    const expiresAt = new Date(
  Date.now() + dados.expires_in * 1000
);

await sql`
  INSERT INTO melhor_envio_tokens (
    id,
    access_token,
    refresh_token,
    expires_at,
    updated_at
  )
  VALUES (
    1,
    ${dados.access_token},
    ${dados.refresh_token},
    ${expiresAt},
    NOW()
  )
  ON CONFLICT (id)
  DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW()
`;
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