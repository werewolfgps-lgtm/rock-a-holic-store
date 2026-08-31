import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import EditarProdutoForm from "./EditarProdutoForm";

type Produto = {
  id: number;
  nome: string;
  slug: string;
  preco: number;
  descricao: string | null;
  imagem_url: string | null;
  imagens: string[];
  modelagem: string | null;
  ativo: boolean;
  tamanhos: string[];
};

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    throw new Error("DATABASE_URL não configurada.");
  }

  const { id } = await params;
  const produtoId = Number(id);

  if (!Number.isInteger(produtoId)) {
    notFound();
  }

  const sql = neon(databaseUrl);

  const resultado = await sql`
    SELECT
      id,
      nome,
      slug,
      preco,
      descricao,
      imagem_url,
      imagens,
      modelagem,
      ativo,
      tamanhos
      FROM produtos
    WHERE id = ${produtoId}
    LIMIT 1
  `;

  if (resultado.length === 0) {
    notFound();
  }
  
  const produto = resultado[0] as Produto;

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/produtos"
          className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400 transition hover:text-white"
        >
          ← Voltar para produtos
        </Link>

        <p className="mt-10 text-xs font-black uppercase tracking-[0.3em] text-red-600">
          Rock-a-Holic Store
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase">
          Editar produto
        </h1>

        <EditarProdutoForm produto={produto} />
      </div>
    </main>
  );
}