import { neon } from "@neondatabase/serverless";

type TokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function getMelhorEnvioToken() {
  const databaseUrl = process.env.DATABASE_URL;
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
  }

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do Melhor Envio não configuradas.");
  }

  const sql = neon(databaseUrl);

  const tokens = (await sql`
    SELECT access_token, refresh_token, expires_at
    FROM melhor_envio_tokens
    WHERE id = 1
    LIMIT 1
  `) as TokenRow[];

  if (tokens.length === 0) {
    throw new Error(
      "Nenhum token do Melhor Envio encontrado. Faça a autorização OAuth."
    );
  }

  const token = tokens[0];

  const expiresAt = new Date(token.expires_at).getTime();

  // Renova com 24 horas de antecedência
  const margemDeSeguranca = 24 * 60 * 60 * 1000;

  if (expiresAt - Date.now() > margemDeSeguranca) {
    return token.access_token;
  }

  const resposta = await fetch(
    "https://sandbox.melhorenvio.com.br/oauth/token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }
  );

  if (!resposta.ok) {
    console.error(
      "Erro ao renovar token do Melhor Envio:",
      resposta.status
    );

    throw new Error("Não foi possível renovar o token do Melhor Envio.");
  }

  const novosTokens = (await resposta.json()) as RefreshResponse;

  if (
    !novosTokens.access_token ||
    !novosTokens.refresh_token ||
    !novosTokens.expires_in
  ) {
    throw new Error("Resposta inválida ao renovar token do Melhor Envio.");
  }

  const novoExpiresAt = new Date(
    Date.now() + novosTokens.expires_in * 1000
  );

  await sql`
    UPDATE melhor_envio_tokens
    SET
      access_token = ${novosTokens.access_token},
      refresh_token = ${novosTokens.refresh_token},
      expires_at = ${novoExpiresAt},
      updated_at = NOW()
    WHERE id = 1
  `;

  return novosTokens.access_token;
}