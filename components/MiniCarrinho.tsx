"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ItemCarrinho = {
  nome: string;
  preco: string;
  tamanho: string;
  quantidade: number;
  imagem?: string;
};

export default function MiniCarrinho() {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  function carregarCarrinho() {
    try {
      const carrinhoSalvo = localStorage.getItem(
        "rockaholic-carrinho"
      );

      const carrinho = carrinhoSalvo
        ? JSON.parse(carrinhoSalvo)
        : [];

      setItens(carrinho);
    } catch {
      setItens([]);
    }
  }

  function salvarCarrinho(novosItens: ItemCarrinho[]) {
    setItens(novosItens);

    localStorage.setItem(
      "rockaholic-carrinho",
      JSON.stringify(novosItens)
    );

    window.dispatchEvent(
      new Event("rockaholic-carrinho-atualizado")
    );
  }

  function aumentarQuantidade(index: number) {
    const novosItens = itens.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    );

    salvarCarrinho(novosItens);
  }

  function diminuirQuantidade(index: number) {
    const item = itens[index];

    if (item.quantidade <= 1) {
      return;
    }

    const novosItens = itens.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, quantidade: item.quantidade - 1 }
        : item
    );

    salvarCarrinho(novosItens);
  }

  function removerItem(index: number) {
    const novosItens = itens.filter(
      (_, itemIndex) => itemIndex !== index
    );

    salvarCarrinho(novosItens);
  }

  useEffect(() => {
  const abrirCarrinho = () => {

    carregarCarrinho();
    setAberto(true);
  };

  window.addEventListener(
    "rockaholic-abrir-carrinho",
    abrirCarrinho
  );

  return () => {
    window.removeEventListener(
      "rockaholic-abrir-carrinho",
      abrirCarrinho
    );
  };
}, []);

  function converterPreco(preco: string) {
    return Number(
      preco
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
    );
  }

  const subtotal = itens.reduce(
    (soma, item) =>
      soma +
      converterPreco(item.preco) * item.quantidade,
    0
  );

  return (
    <>
      {/* FUNDO ESCURECIDO */}
      {aberto && (
        <button
          type="button"
          aria-label="Fechar carrinho"
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/* MINI CARRINHO */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-neutral-950 shadow-2xl transition-transform duration-300 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                Rock-a-Holic Store
              </p>

              <h2 className="mt-1 text-xl font-black uppercase text-white">
                Seu carrinho
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-2xl text-neutral-400 transition hover:text-white"
              aria-label="Fechar carrinho"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {itens.length === 0 ? (
              <p className="text-sm text-neutral-400">
                Seu carrinho está vazio.
              </p>
            ) : (
              <div className="space-y-5">
              {itens.map((item, index) => (
  <div
    key={`${item.nome}-${item.tamanho}-${index}`}
    className="flex gap-4 border-b border-white/10 pb-5"
  >
    {/* IMAGEM DO PRODUTO */}
    {item.imagem && (
      <div className="h-28 w-24 shrink-0 overflow-hidden border border-white/10 bg-black">
        <img
          src={item.imagem}
          alt={item.nome}
          className="h-full w-full object-contain"
        />
      </div>
    )}

    {/* INFORMAÇÕES */}
    <div className="flex-1">
      <p className="font-black text-white">
        {item.nome}
      </p>

      <p className="mt-1 text-xs text-neutral-300">
        Tamanho: {item.tamanho}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
  <div className="flex items-center border border-white/15">
    <button
      type="button"
      onClick={() => diminuirQuantidade(index)}
      disabled={item.quantidade <= 1}
      className="h-8 w-8 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:text-neutral-600"
    >
      −
    </button>

    <span className="min-w-8 text-center text-xs font-bold text-white">
      {item.quantidade}
    </span>

    <button
      type="button"
      onClick={() => aumentarQuantidade(index)}
      className="h-8 w-8 text-sm font-black text-white transition hover:bg-white/10"
    >
      +
    </button>
  </div>

  <button
    type="button"
    onClick={() => removerItem(index)}
    className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 transition hover:text-red-500"
  >
    Remover
  </button>
</div>

      <p className="mt-3 font-black text-[#e7cfaa]">
        {item.preco}
      </p>
    </div>
  </div>
))}  
              </div>
            )}
          </div>

          {itens.length > 0 && (
            <div className="border-t border-white/10 p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-[0.12em] text-white">
                  Subtotal
                </span>

                <span className="text-xl font-black text-[#e7cfaa]">
                  {subtotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/carrinho"
                  onClick={() => setAberto(false)}
                  className="block w-full border border-red-700 bg-red-700 px-5 py-4 text-center text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800"
                >
                  Ver carrinho
                </Link>

                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="w-full px-5 py-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-300 transition hover:text-white"
                >
                  Continuar comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}