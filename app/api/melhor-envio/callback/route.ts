import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  // DADOS RECEBIDOS DO OAUTH
  const stateRecebido = request.nextUrl.searchParams.get("state");
  const stateSalvo =
    request.cookies.get("melhor_envio_oauth_state")?.value;

  // VALIDAÇÃO DE SEGURANÇA DO STATE
  if (
    !stateRecebido ||
    !stateSalvo ||
    stateRecebido !== stateSalvo
  ) {
    return NextResponse.json(
      {
        erro: "Falha na validação de segurança da autorização.",
      },
      { status: 400 }
    );
  }

  const code = request.nextUrl.searchParams.get("code");

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
  const databaseUrl = process.env.DATABASE_URL;

  // VALIDAÇÃO DO CODE
  if (!code) {
    return NextResponse.json(
      {
        erro: "Código de autorização não recebido.",
      },
      { status: 400 }
    );
  }

  // VALIDAÇÃO DAS CREDENCIAIS
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        erro: "Credenciais do Melhor Envio não configuradas.",
      },
      { status: 500 }
    );
  }

  // VALIDAÇÃO DO BANCO
  if (!databaseUrl) {
    return NextResponse.json(
      {
        erro: "Banco de dados não configurado.",
      },
      { status: 500 }
    );
  }

  try {
    // PARÂMETROS PARA TROCAR O CODE PELO TOKEN
    const parametros = new URLSearchParams();

    parametros.set("grant_type", "authorization_code");
    parametros.set("client_id", clientId);
    parametros.set("client_secret", clientSecret);
    parametros.set("redirect_uri", redirectUri);
    parametros.set("code", code);

    // SOLICITA O TOKEN AO MELHOR ENVIO
    const resposta = await fetch(
      "https://sandbox.melhorenvio.com.br/oauth/token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Rock-a-Holic Store (edsonrodrigues400@hotmail.com)",
        },
        body: parametros.toString(),
      }
    );

    const dados = await resposta.json();

    // MOSTRA O ERRO REAL RETORNADO PELO MELHOR ENVIO
    if (!resposta.ok) {
      console.error("Erro OAuth Melhor Envio:", dados);

      return NextResponse.json(
        {
          erro: "Falha ao obter token do Melhor Envio.",
          detalhes: dados,
        },
        { status: resposta.status }
      );
    }

    // CALCULA A DATA DE EXPIRAÇÃO DO TOKEN
    const expiresAt = new Date(
      Date.now() + Number(dados.expires_in) * 1000
    );

    // SALVA OS TOKENS NO NEON
    const sql = neon(databaseUrl);

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
  } catch (error) {
    console.error(
      "Erro ao comunicar com o Melhor Envio:",
      error
    );

    return NextResponse.json(
      {
        erro: "Erro ao comunicar com o Melhor Envio.",
      },
      { status: 500 }
    );
  }
}