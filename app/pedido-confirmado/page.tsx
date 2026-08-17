"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ConteudoPedidoConfirmado() {
  const searchParams = useSearchParams();
  const pedido = searchParams.get("pedido");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="border border-white/10 bg-neutral-950 p-8 sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
          Rock-a-Holic Store
        </p>

        <h1 className="mt-5 text-3xl font-black uppercase sm:text-4xl">
          Pedido confirmado!
        </h1>

        <p className="mt-5 text-neutral-400">
          Recebemos seu pagamento e seu pedido foi confirmado com sucesso.
        </p>

        {pedido && (
          <div className="mt-8 border border-white/10 bg-black p-5">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">
              Número do pedido
            </p>

            <p className="mt-2 break-all font-bold text-[#e7cfaa]">
              {pedido}
            </p>
          </div>
        )}

        <div className="mt-8 border-l-2 border-red-700 pl-5">
          <p className="font-bold">Pagamento aprovado</p>

          <p className="mt-2 text-sm text-neutral-400">
            Agora vamos preparar seu pedido para a próxima etapa.
          </p>
        </div>

        <Link
          href="/"
          className="mt-10 flex w-full items-center justify-center bg-red-700 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-20 text-white">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl text-center text-neutral-400">
            Carregando pedido...
          </div>
        }
      >
        <ConteudoPedidoConfirmado />
      </Suspense>
    </main>
  );
}