import { NextResponse } from "next/server";
import { getMelhorEnvioToken } from "../token";

export async function GET() {
  try {
    const token = await getMelhorEnvioToken();

    return NextResponse.json({
      sucesso: true,
      mensagem: "Token do Melhor Envio carregado com sucesso.",
      token_disponivel: Boolean(token),
    });
  } catch (error) {
    console.error("Erro ao testar token do Melhor Envio:", error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Não foi possível carregar o token do Melhor Envio.",
      },
      { status: 500 }
    );
  }
}