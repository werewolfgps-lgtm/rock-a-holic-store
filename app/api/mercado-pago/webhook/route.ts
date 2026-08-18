import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("WEBHOOK MERCADO PAGO RECEBIDO:");
    console.log(JSON.stringify(body, null, 2));

    return NextResponse.json(
      {
        recebido: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao receber webhook do Mercado Pago:",
      error
    );

    return NextResponse.json(
      {
        erro: "Erro ao processar webhook.",
      },
      {
        status: 500,
      }
    );
  }
}