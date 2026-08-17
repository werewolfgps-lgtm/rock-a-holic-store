import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { erro: "Banco de dados não configurado." },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);
    const body = await request.json();

    const {
      mercadoPagoOrderId,
      statusPagamento,
      cliente,
      frete,
      subtotal,
      total,
      itens,
    } = body;

    if (
      !mercadoPagoOrderId ||
      !statusPagamento ||
      !cliente?.nome ||
      !cliente?.email ||
      !cliente?.cep ||
      !cliente?.endereco ||
      !cliente?.numero ||
      !cliente?.bairro ||
      !cliente?.cidade ||
      !cliente?.estado ||
      !Array.isArray(itens) ||
      itens.length === 0
    ) {
      return NextResponse.json(
        { erro: "Dados do pedido incompletos." },
        { status: 400 }
      );
    }

    const resultado = await sql`
      INSERT INTO pedidos (
        mercado_pago_order_id,
        status_pagamento,
        nome_cliente,
        email_cliente,
        telefone_cliente,
        cep,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        frete_empresa,
        frete_nome,
        frete_preco,
        frete_prazo,
        subtotal,
        total,
        itens,
        updated_at
      )
      VALUES (
        ${mercadoPagoOrderId},
        ${statusPagamento},
        ${cliente.nome},
        ${cliente.email},
        ${cliente.telefone || null},
        ${cliente.cep},
        ${cliente.endereco},
        ${cliente.numero},
        ${cliente.complemento || null},
        ${cliente.bairro},
        ${cliente.cidade},
        ${cliente.estado},
        ${frete?.empresa || null},
        ${frete?.nome || null},
        ${Number(frete?.preco || 0)},
        ${frete?.prazo ?? null},
        ${Number(subtotal)},
        ${Number(total)},
        ${JSON.stringify(itens)}::jsonb,
        NOW()
      )
      ON CONFLICT (mercado_pago_order_id)
      DO UPDATE SET
        status_pagamento = EXCLUDED.status_pagamento,
        updated_at = NOW()
      RETURNING id, mercado_pago_order_id, status_pagamento;
    `;

    return NextResponse.json({
      sucesso: true,
      pedido: resultado[0],
    });
  } catch (error) {
    console.error("Erro ao salvar pedido:", error);

    return NextResponse.json(
      { erro: "Não foi possível salvar o pedido." },
      { status: 500 }
    );
  }
}