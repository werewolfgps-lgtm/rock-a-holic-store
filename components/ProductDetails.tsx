"use client";

import { useState } from "react";

type ProductDetailsProps = {
  nome: string;
  preco: string;
  imagem: string;
};

export default function ProductDetails({
  nome,
  preco,
  imagem,
}: ProductDetailsProps) {
  const [tamanho, setTamanho] = useState("");
  const [quantidade, setQuantidade] = useState(1);

  function adicionarAoCarrinho() {
  if (!tamanho) {
    alert("Escolha um tamanho antes de adicionar ao carrinho.");
    return;
  }

  const carrinhoAtual = JSON.parse(
    localStorage.getItem("rockaholic-carrinho") || "[]"
  );

  const itemExistenteIndex = carrinhoAtual.findIndex(
    (item: {
      nome: string;
      tamanho: string;
    }) =>
      item.nome === nome &&
      item.tamanho === tamanho
  );

  let carrinhoAtualizado;

  if (itemExistenteIndex >= 0) {
    carrinhoAtualizado = carrinhoAtual.map(
      (
        item: {
          nome: string;
          preco: string;
          tamanho: string;
          quantidade: number;
          imagem: string;
        },
        index: number
      ) =>
        index === itemExistenteIndex
          ? {
              ...item,
              quantidade: item.quantidade + quantidade,
            }
          : item
    );
  } else {
    const novoItem = {
      nome,
      preco,
      tamanho,
      quantidade,
      imagem,
    };

    carrinhoAtualizado = [
      ...carrinhoAtual,
      novoItem,
    ];
  }

  localStorage.setItem(
    "rockaholic-carrinho",
    JSON.stringify(carrinhoAtualizado)
  );

  window.dispatchEvent(
    new Event("rockaholic-carrinho-atualizado")
  );

  alert("Produto adicionado ao carrinho!");
}

  return (
    <>
      <div className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em]">
          Escolha o tamanho
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {["P", "M", "G", "GG"].map((item) => (
            <button
              key={item}
              onClick={() => setTamanho(item)}
              className={`h-12 w-12 border text-sm font-black transition ${
                tamanho === item
                  ? "border-red-600 bg-red-700"
                  : "border-white/20 hover:border-red-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-xs font-black uppercase tracking-[0.2em]">
          Quantidade
        </p>

        <div className="mt-4 flex w-fit items-center border border-white/20">
          <button
            onClick={() =>
              setQuantidade((valor) => Math.max(1, valor - 1))
            }
            className="h-12 w-12 text-xl hover:bg-white/10"
          >
            −
          </button>

          <span className="flex h-12 w-14 items-center justify-center border-x border-white/20 font-bold">
            {quantidade}
          </span>

          <button
            onClick={() => setQuantidade((valor) => valor + 1)}
            className="h-12 w-12 text-xl hover:bg-white/10"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={adicionarAoCarrinho}
        className="mt-10 w-full bg-red-700 px-8 py-5 text-sm font-black uppercase tracking-[0.2em] transition hover:bg-red-800"
      >
        Adicionar ao carrinho — {preco}
      </button>
    </>
  );
}