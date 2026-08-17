import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const statusPermitidos = [
  "novo",
  "preparando",
  "enviado",
  "entregue",
];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        { erro: "Banco de dados não configurado." },
        { status: 500 }
      );
    }

    const { id } = await context.params;
    const pedidoId = Number(id);

    if (!Number.isInteger(pedidoId)) {
      return NextResponse.json(
        { erro: "Pedido inválido." },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!statusPermitidos.includes(status)) {
      return NextResponse.json(
        { erro: "Status inválido." },
        { status: 400 }
      );
    }

    const sql = neon(databaseUrl);

    const resultado = await sql`
      UPDATE pedidos
      SET
        status_pedido = ${status},
        updated_at = NOW()
      WHERE id = ${pedidoId}
      RETURNING id, status_pedido
    `;

    if (resultado.length === 0) {
      return NextResponse.json(
        { erro: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      pedido: resultado[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);

    return NextResponse.json(
      { erro: "Não foi possível atualizar o status." },
      { status: 500 }
    );
  }
}