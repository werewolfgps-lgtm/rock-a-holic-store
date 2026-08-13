"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ItemCarrinho = {
  nome: string;
  preco: string;
  tamanho: string;
  quantidade: number;
  imagem?: string;
  slug?: string;
};

export default function CarrinhoPage() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem("rockaholic-carrinho");

    if (carrinhoSalvo) {
      setItens(JSON.parse(carrinhoSalvo));
    }
  }, []);

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
  function removerItem(index: number) {
    const carrinhoAtualizado = itens.filter(
      (_, itemIndex) => itemIndex !== index
    );

    salvarCarrinho(carrinhoAtualizado);
  }

  function aumentarQuantidade(index: number) {
    const carrinhoAtualizado = itens.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    );

    salvarCarrinho(carrinhoAtualizado);
  }

  function diminuirQuantidade(index: number) {
    const carrinhoAtualizado = itens.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }

      return {
        ...item,
        quantidade: Math.max(1, item.quantidade - 1),
      };
    });

    salvarCarrinho(carrinhoAtualizado);
  }

function limparCarrinho() {
  setItens([]);

  localStorage.removeItem("rockaholic-carrinho");

  window.dispatchEvent(
    new Event("rockaholic-carrinho-atualizado")
  );
}

  function converterPreco(preco: string) {
    return Number(
      preco
        .replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
    );
  }

  const total = itens.reduce((soma, item) => {
    return soma + converterPreco(item.preco) * item.quantidade;
  }, 0);

  const totalItens = itens.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-300 transition hover:border-red-700 hover:bg-red-700 hover:text-white"
        >
          ← Continuar comprando
        </Link>

        <div className="mt-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Rock-a-Holic Store
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
              Seu carrinho
            </h1>
          </div>

          {itens.length > 0 && (
            <button
              onClick={limparCarrinho}
              className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500 transition hover:text-red-500"
            >
              Limpar carrinho
            </button>
          )}
        </div>

        {itens.length === 0 ? (
          <div className="mt-16 border border-white/10 bg-neutral-950 p-10 text-center">
            <p className="text-xl font-bold">
              Seu carrinho está vazio.
            </p>

            <p className="mt-3 text-neutral-500">
              Escolha uma camiseta e volte aqui para finalizar seu pedido.
            </p>

            <Link
              href="/#loja"
              className="mt-8 inline-flex bg-red-700 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div
                  key={`${item.nome}-${item.tamanho}-${index}`}
                  className="grid gap-6 border border-white/10 bg-neutral-950 p-5 sm:grid-cols-[130px_1fr_auto] sm:items-center"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f2f2f2]">
                    {item.imagem ? (
                      <Image
                        src={item.imagem}
                        alt={`Camiseta ${item.nome}`}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold uppercase text-neutral-500">
                        Rock-a-Holic
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                      Rock-a-Holic
                    </p>

                    <Link
  href={item.slug ? `/produto/${item.slug}` : "#"}
  className="mt-2 inline-block text-xl font-black transition hover:text-red-500"
>
  {item.nome}
</Link>

                    <p className="mt-3 text-sm text-neutral-400">
                      Tamanho: {item.tamanho}
                    </p>

                    <div className="mt-5 flex w-fit items-center border border-white/20">
                      <button
                        onClick={() => diminuirQuantidade(index)}
                        className="h-10 w-10 text-lg transition hover:bg-white/10"
                      >
                        −
                      </button>

                      <span className="flex h-10 w-12 items-center justify-center border-x border-white/20 text-sm font-bold">
                        {item.quantidade}
                      </span>

                      <button
                        onClick={() => aumentarQuantidade(index)}
                        className="h-10 w-10 text-lg transition hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                 <div className="sm:text-right">
  <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">
    Subtotal
  </p>

  <p className="mt-1 text-lg font-bold text-[#e7cfaa]">
    {(
      converterPreco(item.preco) * item.quantidade
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })}
  </p>

  <button
    onClick={() => removerItem(index)}
    className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-neutral-500 transition hover:text-red-500"
  >
    Remover
  </button>
</div>
                </div>
              ))}
            </div>

            <aside className="h-fit border border-white/10 bg-neutral-950 p-7">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                Resumo
              </p>

              <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">
                    Itens
                  </span>

                  <span>{totalItens}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-400">
                    Frete
                  </span>

                  <span className="text-neutral-500">
                    Calculado depois
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between">
                <span className="font-bold uppercase">
                  Total
                </span>

                <span className="text-2xl font-black text-[#e7cfaa]">
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>

             <Link
  href="/checkout"
  className="mt-7 flex w-full items-center justify-center bg-red-700 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800"
>
  Finalizar compra
</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}