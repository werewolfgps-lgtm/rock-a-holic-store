"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setEntrando(true);
      setErro("");

      const resposta = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ senha }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível entrar."
        );
      }

      router.push("/admin/pedidos");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar."
      );
    } finally {
      setEntrando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md border border-white/10 bg-neutral-950 p-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
          Rock-a-Holic Store
        </p>

        <h1 className="mt-4 text-3xl font-black uppercase">
          Área administrativa
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          Digite sua senha para acessar os pedidos.
        </p>

        <form onSubmit={entrar} className="mt-8">
          <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
            Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
          />

          {erro && (
            <p className="mt-3 text-sm text-red-500">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando}
            className="mt-6 w-full bg-red-700 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800 disabled:opacity-50"
          >
            {entrando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}