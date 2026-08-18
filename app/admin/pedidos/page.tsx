import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

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

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    busca?: string;
  }>;
}) {
  const params = await searchParams;
  const busca = (params.busca || "").trim();

const statusSelecionado = params.status || "todos";

const statusValidos = [
  "todos",
  "novo",
  "preparando",
  "enviado",
  "entregue",
];

const statusFiltro = statusValidos.includes(statusSelecionado)
  ? statusSelecionado
  : "todos";
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

  const contagens = (await sql`
  SELECT
    COUNT(*)::int AS todos,
    COUNT(*) FILTER (WHERE status_pedido = 'novo')::int AS novos,
    COUNT(*) FILTER (WHERE status_pedido = 'preparando')::int AS preparando,
    COUNT(*) FILTER (WHERE status_pedido = 'enviado')::int AS enviados,
    COUNT(*) FILTER (WHERE status_pedido = 'entregue')::int AS entregues
  FROM pedidos
`) as {
  todos: number;
  novos: number;
  preparando: number;
  enviados: number;
  entregues: number;
}[];

const quantidadeStatus = contagens[0];

  const pedidos = statusFiltro === "todos"
  ? ((await sql`
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
      WHERE (
        ${busca} = ''
        OR nome_cliente ILIKE ${`%${busca}%`}
        OR email_cliente ILIKE ${`%${busca}%`}
        OR CAST(id AS TEXT) = ${busca.replace("#", "")}
      )
      ORDER BY id DESC
      LIMIT 100
    `) as Pedido[])
  : ((await sql`
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
      WHERE status_pedido = ${statusFiltro}
        AND (
          ${busca} = ''
          OR nome_cliente ILIKE ${`%${busca}%`}
          OR email_cliente ILIKE ${`%${busca}%`}
          OR CAST(id AS TEXT) = ${busca.replace("#", "")}
        )
      ORDER BY id DESC
      LIMIT 100
    `) as Pedido[]);

    {/* BUSCA DE PEDIDOS */}
<form
  action="/admin/pedidos"
  method="GET"
  className="mt-6 flex max-w-xl gap-2"
>
  {statusFiltro !== "todos" && (
    <input
      type="hidden"
      name="status"
      value={statusFiltro}
    />
  )}

  <input
    type="text"
    name="busca"
    defaultValue={busca}
    placeholder="Buscar por pedido, nome ou e-mail"
    className="min-w-0 flex-1 border border-white/10 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
  />

  <button
    type="submit"
    className="bg-red-700 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] transition hover:bg-red-800"
  >
    Buscar
  </button>
</form>

  return (

        <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
          Rock-a-Holic Store
        </p>

       {/* CABEÇALHO DO ADMIN */}
        <div className="mt-3 flex items-end justify-between gap-4">
         <div>
         <h1 className="text-4xl font-black uppercase">
           Pedidos
         </h1>

            <p className="mt-3 text-neutral-500">
      {pedidos.length} pedido(s) encontrado(s)
         </p>
         </div>
         {/* FILTROS DOS PEDIDOS */}
<div className="mt-8 flex flex-wrap gap-2">
  <Link
    href="/admin/pedidos"
    className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
      statusFiltro === "todos"
        ? "border-red-600 bg-red-700 text-white"
        : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
    }`}
  >
    Todos ({quantidadeStatus.todos})
  </Link>

  <Link
    href="/admin/pedidos?status=novo"
    className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
      statusFiltro === "novo"
        ? "border-red-600 bg-red-700 text-white"
        : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
    }`}
  >
          Novos ({quantidadeStatus.novos})
  </Link>

  <Link
    href="/admin/pedidos?status=preparando"
    className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
      statusFiltro === "preparando"
        ? "border-red-600 bg-red-700 text-white"
        : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
    }`}
  >
          Preparando ({quantidadeStatus.preparando})
  </Link>

  <Link
    href="/admin/pedidos?status=enviado"
    className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
      statusFiltro === "enviado"
        ? "border-red-600 bg-red-700 text-white"
        : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
    }`}
  >
        Enviados ({quantidadeStatus.enviados})
  </Link>

  <Link
    href="/admin/pedidos?status=entregue"
    className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
      statusFiltro === "entregue"
        ? "border-red-600 bg-red-700 text-white"
        : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
    }`}
  >
        Entregues ({quantidadeStatus.entregues})
  </Link>
</div>

         <LogoutButton />
        </div>
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