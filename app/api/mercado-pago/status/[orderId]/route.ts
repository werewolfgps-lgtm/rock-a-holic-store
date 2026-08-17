import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { erro: "Access Token do Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const { orderId } = await context.params;

    const resposta = await fetch(
      `https://api.mercadopago.com/v1/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro ao consultar order Mercado Pago:", dados);

      return NextResponse.json(
        { erro: "Não foi possível consultar o pagamento." },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      sucesso: true,
      orderId: dados.id,
      status: dados.status,
      statusDetail: dados.status_detail || null,
    });
  } catch (error) {
    console.error("Erro interno ao consultar pagamento:", error);

    return NextResponse.json(
      { erro: "Erro interno ao consultar pagamento." },
      { status: 500 }
    );
  }
}