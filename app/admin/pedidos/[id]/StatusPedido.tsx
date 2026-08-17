"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const opcoes = [
  { valor: "novo", label: "Novo" },
  { valor: "preparando", label: "Preparando" },
  { valor: "enviado", label: "Enviado" },
  { valor: "entregue", label: "Entregue" },
];

export default function StatusPedido({
  pedidoId,
  statusAtual,
}: {
  pedidoId: number;
  statusAtual: string;
}) {
  const router = useRouter();

  const [status, setStatus] = useState(statusAtual);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function alterarStatus(novoStatus: string) {
    try {
      setSalvando(true);
      setErro("");

      const resposta = await fetch(
        `/api/admin/pedidos/${pedidoId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro || "Não foi possível alterar o status."
        );
      }

      setStatus(novoStatus);
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
        Status do pedido
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            disabled={salvando}
            onClick={() => alterarStatus(opcao.valor)}
            className={`border px-4 py-3 text-xs font-black uppercase tracking-[0.1em] transition ${
              status === opcao.valor
                ? "border-red-600 bg-red-700 text-white"
                : "border-white/10 text-neutral-400 hover:border-red-600 hover:text-white"
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {salvando && (
        <p className="mt-3 text-xs text-neutral-500">
          Atualizando...
        </p>
      )}

      {erro && (
        <p className="mt-3 text-xs text-red-500">
          {erro}
        </p>
      )}
    </div>
  );
}