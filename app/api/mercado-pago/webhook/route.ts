import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (!secret) {
      return NextResponse.json(
        { erro: "Webhook secret não configurado." },
        { status: 500 }
      );
    }

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");

    const dataId =
      request.nextUrl.searchParams.get("data.id");

    if (!xSignature || !xRequestId || !dataId) {
      return NextResponse.json(
        { erro: "Assinatura do webhook incompleta." },
        { status: 401 }
      );
    }

    const partes = Object.fromEntries(
      xSignature.split(",").map((parte) => {
        const [chave, valor] = parte.split("=");
        return [chave.trim(), valor.trim()];
      })
    );

    const ts = partes.ts;
    const v1 = partes.v1;

    if (!ts || !v1) {
      return NextResponse.json(
        { erro: "Assinatura inválida." },
        { status: 401 }
      );
    }

    const manifesto =
      `id:${dataId};` +
      `request-id:${xRequestId};` +
      `ts:${ts};`;

    const assinaturaCalculada = crypto
      .createHmac("sha256", secret)
      .update(manifesto)
      .digest("hex");

    const assinaturaValida = crypto.timingSafeEqual(
      Buffer.from(assinaturaCalculada),
      Buffer.from(v1)
    );

    if (!assinaturaValida) {
      return NextResponse.json(
        { erro: "Webhook não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    console.log("WEBHOOK MERCADO PAGO VALIDADO:", {
      dataId,
      type: body?.type,
      action: body?.action,
    });

    return NextResponse.json({
      recebido: true,
      validado: true,
      dataId,
    });
  } catch (error) {
    console.error(
      "Erro ao validar webhook do Mercado Pago:",
      error
    );

    return NextResponse.json(
      { erro: "Erro ao processar webhook." },
      { status: 500 }
    );
  }
}