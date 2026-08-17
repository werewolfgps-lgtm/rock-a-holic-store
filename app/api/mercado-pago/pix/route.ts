import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { erro: "Access Token do Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const valor = Number(body.valor);

    if (!valor || valor <= 0) {
      return NextResponse.json(
        { erro: "Valor inválido para pagamento." },
        { status: 400 }
      );
    }
    const idempotencyKey = crypto.randomUUID();

    const resposta = await fetch(
      "https://api.mercadopago.com/v1/orders",
      {
        method: "POST",
        headers: {
         Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          type: "online",
          external_reference: `rockaholic-${Date.now()}`,
          total_amount: valor.toFixed(2),
          processing_mode: "automatic",

          payer: {
            email: "test_user_br@testuser.com",
            first_name: "APRO",
          },

          transactions: {
            payments: [
              {
                amount: valor.toFixed(2),
                payment_method: {
                  id: "pix",
                  type: "bank_transfer",
                },
              },
            ],
          },
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
  console.error("Erro Mercado Pago:", dados);

  return NextResponse.json(
    {
      erro: "Não foi possível criar o pagamento Pix.",
      statusMercadoPago: resposta.status,
      detalhes: dados,
    },
    { status: resposta.status }
  );
}
    const pagamento = dados.transactions?.payments?.[0];

    return NextResponse.json({
      sucesso: true,
      orderId: dados.id,
      status: dados.status,
      qrCode: pagamento?.payment_method?.qr_code || null,
      ticketUrl: pagamento?.payment_method?.ticket_url || null,
    });
  } catch (error) {
    console.error("Erro interno Mercado Pago:", error);

    return NextResponse.json(
      { erro: "Erro interno ao criar pagamento Pix." },
      { status: 500 }
    );
  }
}