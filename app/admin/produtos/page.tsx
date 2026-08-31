import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

type Produto = {
  id: number;
  nome: string;
  slug: string;
  preco: number;
  descricao: string | null;
  imagem_url: string | null;
  ativo: boolean;
  tamanhos: string[];
  created_at: string;
};

export default async function AdminProdutosPage() {
  const senhaAdmin = process.env.ADMIN_PASSWORD;

  if (!senhaAdmin) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const tokenSalvo =
    cookieStore.get("rockaholic-admin")?.value;

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

  const produtos = (await sql`
    SELECT
      id,
      nome,
      slug,
      preco,
      descricao,
      imagem_url,
      ativo,
      tamanhos,
      created_at
    FROM produtos
    ORDER BY id DESC
  `) as Produto[];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Rock-a-Holic Store
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase">
              Produtos
            </h1>

            <p className="mt-3 text-neutral-500">
              {produtos.length} produto(s) cadastrado(s)
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/pedidos"
              className="border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-neutral-300 transition hover:border-red-600 hover:text-white"
            >
              Pedidos
            </Link>

            <Link
              href="/admin/produtos/novo"
              className="bg-red-700 px-5 py-3 text-xs font-black uppercase tracking-[0.1em] transition hover:bg-red-800"
            >
              + Novo produto
            </Link>

            <LogoutButton />
          </div>
        </div>

        <div className="mt-10 overflow-x-auto border border-white/10">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-neutral-950 text-xs uppercase tracking-[0.1em] text-neutral-500">
              <tr>
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Preço</th>
                <th className="px-5 py-4">Tamanhos</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-neutral-500"
                  >
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => (
                  <tr
                    key={produto.id}
                    className="border-t border-white/10 bg-black"
                  >
                    <td className="px-5 py-5 font-black">
                      #{produto.id}
                    </td>

                    <td className="px-5 py-5">
  <div className="flex items-center gap-4">

    {/* IMAGEM DO PRODUTO */}
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-neutral-950">
      {produto.imagem_url ? (
        <img
          src={produto.imagem_url}
          alt={produto.nome}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="px-2 text-center text-[10px] font-bold uppercase text-neutral-600">
          Sem imagem
        </span>
      )}
    </div>

    {/* INFORMAÇÕES */}
    <div>
      <p className="font-black text-white">
        {produto.nome}
      </p>

      <p className="mt-1 text-xs text-neutral-500">
        {produto.slug}
      </p>
    </div>

  </div>
</td>

                    <td className="px-5 py-5 font-bold text-[#e7cfaa]">
                      {Number(produto.preco).toLocaleString(
                        "pt-BR",
                        {
                          style: "currency",
                          currency: "BRL",
                        }
                      )}
                    </td>

                    <td className="px-5 py-5 text-neutral-300">
                      {produto.tamanhos?.join(", ")}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={`text-xs font-black uppercase ${
                          produto.ativo
                            ? "text-green-500"
                            : "text-neutral-600"
                        }`}
                      >
                        {produto.ativo
                          ? "Ativo"
                          : "Inativo"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <Link
                        href={`/admin/produtos/${produto.id}`}
                        className="text-xs font-black uppercase tracking-[0.1em] text-red-500 transition hover:text-red-400"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}