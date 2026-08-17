import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

type Pedido = {
  id: number;
  mercado_pago_order_id: string;
  status_pagamento: string;
  nome_cliente: string;
  email_cliente: string;
  frete_nome: string | null;
  frete_preco: string;
  subtotal: string;
  total: string;
  created_at: string;
  status_pedido: string;
};

export default async function AdminPedidosPage() {
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
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Banco de dados não configurado.
      </main>
    );
  }

  const sql = neon(databaseUrl);

  const pedidos = (await sql`
    SELECT
      id,
      mercado_pago_order_id,
      status_pagamento,
      status_pedido,
      nome_cliente,
      email_cliente,
      frete_nome,
      frete_preco,
      subtotal,
      total,
      created_at
    FROM pedidos
    ORDER BY id DESC
    LIMIT 100
  `) as Pedido[];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
          Rock-a-Holic Store
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase">
          Pedidos
        </h1>

        <p className="mt-3 text-neutral-500">
          {pedidos.length} pedido(s) encontrado(s)
        </p>

        <div className="mt-10 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-neutral-950 text-xs uppercase tracking-[0.1em] text-neutral-500">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Pagamento</th>
                <th className="px-5 py-4">Status do pedido</th>
                <th className="px-5 py-4">Frete</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Data</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.map((pedido) => (
               <tr
  key={pedido.id}
  className="border-t border-white/10 bg-black"
>
  <td className="px-5 py-5">
    <Link
      href={`/admin/pedidos/${pedido.id}`}
      className="font-black text-white transition hover:text-red-500"
    >
      #{pedido.id}
    </Link>

    <p className="mt-1 max-w-[180px] truncate text-xs text-neutral-600">
      {pedido.mercado_pago_order_id}
    </p>
  </td>

  <td className="px-5 py-5">
    <p className="font-bold">
      {pedido.nome_cliente}
    </p>

    <p className="mt-1 text-xs text-neutral-500">
      {pedido.email_cliente}
    </p>
  </td>
    {/* PAGAMENTO */}
  <td className="px-5 py-5">
  <span className="inline-block border border-green-700/40 bg-green-950/20 px-3 py-2 text-xs font-bold uppercase text-green-500">
    {pedido.status_pagamento === "processed"
      ? "Pago"
      : pedido.status_pagamento}
  </span>
</td>
    {/* STATUS DO PEDIDO */}
 <td className="px-5 py-5">
  <span className="inline-block border border-white/20 px-3 py-2 text-xs font-bold uppercase text-neutral-300">
    {pedido.status_pedido === "novo" && "Novo"}
    {pedido.status_pedido === "preparando" && "Preparando"}
    {pedido.status_pedido === "enviado" && "Enviado"}
    {pedido.status_pedido === "entregue" && "Entregue"}
  </span>
</td>
    {/* FRETE */}
<td className="px-5 py-5 text-neutral-400">
  {pedido.frete_nome || "Retirada no local"}
</td>

<td className="px-5 py-5 font-black text-[#e7cfaa]">
  {Number(pedido.total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}
</td>

  <td className="px-5 py-5 text-neutral-400">
    {new Date(pedido.created_at).toLocaleString("pt-BR")}
  </td>
</tr>
              ))}
            </tbody>
          </table>
        </div>

        {pedidos.length === 0 && (
          <div className="border-x border-b border-white/10 p-10 text-center text-neutral-500">
            Nenhum pedido encontrado.
          </div>
        )}
      </div>
    </main>
  );
}