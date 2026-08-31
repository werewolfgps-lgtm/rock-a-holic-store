import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import NovoProdutoForm from "./NovoProdutoForm";

export default async function NovoProdutoPage() {
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
          Novo produto
        </h1>

        <p className="mt-3 text-neutral-500">
          Cadastre uma nova camiseta no catálogo.
        </p>

        <NovoProdutoForm />
      </div>
    </main>
  );
}