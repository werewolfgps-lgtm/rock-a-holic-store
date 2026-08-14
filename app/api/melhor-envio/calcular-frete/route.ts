import { NextRequest, NextResponse } from "next/server";
import { getMelhorEnvioToken } from "../token";

export async function POST(request: NextRequest) {
  try {
    const { cepDestino } = await request.json();

    if (!cepDestino) {
      return NextResponse.json(
        { erro: "CEP de destino não informado." },
        { status: 400 }
      );
    }

    const cepLimpo = String(cepDestino).replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { erro: "CEP de destino inválido." },
        { status: 400 }
      );
    }

    const token = await getMelhorEnvioToken();

    const resposta = await fetch(
      "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Rock-a-Holic Store",
        },
        body: JSON.stringify({
          from: {
            postal_code: "88160648",
          },
          to: {
            postal_code: cepLimpo,
          },
          package: {
            height: 4,
            width: 20,
            length: 30,
            weight: 0.3,
          },
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro ao calcular frete no Melhor Envio:", dados);

      return NextResponse.json(
        {
          erro: "Não foi possível calcular o frete.",
        },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      sucesso: true,
      fretes: dados,
    });
  } catch (error) {
    console.error("Erro interno no cálculo de frete:", error);

    return NextResponse.json(
      {
        erro: "Erro interno ao calcular o frete.",
      },
      { status: 500 }
    );
  }
}