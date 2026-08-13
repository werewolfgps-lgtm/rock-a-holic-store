"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ItemCarrinho = {
  quantidade: number;
};

export default function CartButton() {
  const [totalItens, setTotalItens] = useState(0);

  function lerCarrinho() {
    const carrinhoSalvo = localStorage.getItem("rockaholic-carrinho");

    if (!carrinhoSalvo) {
      setTotalItens(0);
      return;
    }

    try {
      const itens: ItemCarrinho[] = JSON.parse(carrinhoSalvo);

      const total = itens.reduce(
        (soma, item) => soma + item.quantidade,
        0
      );

      setTotalItens(total);
    } catch {
      setTotalItens(0);
    }
  }

  useEffect(() => {
    lerCarrinho();

    const atualizar = () => {
      lerCarrinho();
    };

    window.addEventListener(
      "rockaholic-carrinho-atualizado",
      atualizar
    );

    return () => {
      window.removeEventListener(
        "rockaholic-carrinho-atualizado",
        atualizar
      );
    };
  }, []);

  return (
    <Link
      href="/carrinho"
      className="border border-red-700/60 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-700"
    >
     Carrinho {totalItens > 0 && `(${totalItens})`}
    </Link>
  );
}