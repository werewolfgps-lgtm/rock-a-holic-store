import crypto from "crypto";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";

type ItemPedido = {
  nome: string;
  preco: string;
  tamanho: string;
  quantidade: number;
  imagem?: string;
  slug?: string;
};

type Pedido = {
  id: number;
  mercado_pago_order_id: string;
  status_pagamento: string;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  frete_empresa: string | null;
  frete_nome: string | null;
  frete_preco: string;
  frete_prazo: number | null;
  subtotal: string;
  total: string;
  itens: ItemPedido[];
  created_at: string;
};

export default async function PedidoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const senhaAdmin = process.env.ADMIN_PASSWORD;

  if (!senhaAdmin) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const tokenSalvo = cookieStore.get("rockaholic-admin")?.value;

  const tokenEsperado = crypto
    .createHash("sha256")
    .update(`${senhaAdmin}-rockaholic-admin`)
    .digest("hex");

  if (!tokenSalvo || tokenSalvo !== tokenEsperado) {
    redirect("/admin");
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const { id } = await params;

  const pedidoId = Number(id);

  if (!Number.isInteger(pedidoId)) {
    notFound();
  }

  const sql = neon(databaseUrl);

  const resultado = (await sql`
    SELECT
      id,
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
      created_at
    FROM pedidos
    WHERE id = ${pedidoId}
    LIMIT 1
  `) as Pedido[];

  if (resultado.length === 0) {
    notFound();
  }

  const pedido = resultado[0];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/pedidos"
          className="text-xs font-black uppercase tracking-[0.15em] text-neutral-500 transition hover:text-red-500"
        >
          ← Voltar para pedidos
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Rock-a-Holic Store
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase">
              Pedido #{pedido.id}
            </h1>

            <p className="mt-3 text-sm text-neutral-500">
              {new Date(pedido.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <span className="w-fit border border-green-700/40 bg-green-950/20 px-4 py-3 text-xs font-black uppercase text-green-500">
            {pedido.status_pagamento}
          </span>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="border border-white/10 bg-neutral-950 p-7">
            <h2 className="text-lg font-black uppercase">
              Cliente
            </h2>

            <div className="mt-6 space-y-3 text-sm">
              <p>
                <span className="text-neutral-500">Nome:</span>{" "}
                {pedido.nome_cliente}
              </p>

              <p>
                <span className="text-neutral-500">E-mail:</span>{" "}
                {pedido.email_cliente}
              </p>

              <p>
                <span className="text-neutral-500">Telefone:</span>{" "}
                {pedido.telefone_cliente || "Não informado"}
              </p>
            </div>
          </section>

          <section className="border border-white/10 bg-neutral-950 p-7">
            <h2 className="text-lg font-black uppercase">
              Entrega
            </h2>

            <div className="mt-6 space-y-3 text-sm">
              <p>
                {pedido.endereco}, {pedido.numero}
              </p>

              {pedido.complemento && (
                <p>{pedido.complemento}</p>
              )}

              <p>
                {pedido.bairro} — {pedido.cidade}/{pedido.estado}
              </p>

              <p>CEP: {pedido.cep}</p>

              <div className="border-t border-white/10 pt-4">
                <p>
                  <span className="text-neutral-500">Entrega:</span>{" "}
                  {pedido.frete_nome || "Retirada no local"}
                </p>

                {pedido.frete_empresa && (
                  <p className="mt-2">
                    <span className="text-neutral-500">
                      Transportadora:
                    </span>{" "}
                    {pedido.frete_empresa}
                  </p>
                )}

                {pedido.frete_prazo !== null && (
                  <p className="mt-2">
                    Prazo: {pedido.frete_prazo} dia(s)
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 border border-white/10 bg-neutral-950 p-7">
          <h2 className="text-lg font-black uppercase">
            Produtos
          </h2>

          <div className="mt-6 space-y-4">
            {pedido.itens.map((item, index) => (
              <div
                key={`${item.nome}-${item.tamanho}-${index}`}
                className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-bold">{item.nome}</p>

                  <p className="mt-1 text-sm text-neutral-500">
                    Tamanho {item.tamanho} · Qtd. {item.quantidade}
                  </p>
                </div>

                <p className="font-bold text-[#e7cfaa]">
                  {item.preco}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 border border-white/10 bg-neutral-950 p-7">
          <h2 className="text-lg font-black uppercase">
            Valores
          </h2>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>

              <span>
                {Number(pedido.subtotal).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Frete</span>

              <span>
                {Number(pedido.frete_preco).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="font-black uppercase">
                Total
              </span>

              <span className="text-2xl font-black text-[#e7cfaa]">
                {Number(pedido.total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 border border-white/10 bg-neutral-950 p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
            Mercado Pago Order ID
          </p>

          <p className="mt-2 break-all text-sm">
            {pedido.mercado_pago_order_id}
          </p>
        </div>
      </div>
    </main>
  );
}