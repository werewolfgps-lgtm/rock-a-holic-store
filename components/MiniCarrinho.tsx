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
  const [cep, setCep] = useState("");
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState("");
  const [fretes, setFretes] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any | null>(null);

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

  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length === 8) {
    calcularFrete(cepLimpo, novosItens);
  }
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
  const valorFrete = freteSelecionado?.preco || 0;

const total = subtotal + valorFrete;

  {/* RESUMO DO PEDIDO */}
<div className="mb-5 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold uppercase text-neutral-300">
      Subtotal
    </span>

    <span className="font-bold text-white">
      {subtotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </span>
  </div>

  <div className="flex items-center justify-between">
    <span className="text-xs font-bold uppercase text-neutral-300">
      Entrega
    </span>

    <span className="font-bold text-white">
      {freteSelecionado
        ? valorFrete === 0
          ? "Grátis"
          : valorFrete.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
        : "Selecione"}
    </span>
  </div>

  <div className="border-t border-white/10 pt-4">
    <div className="flex items-center justify-between">
      <span className="text-sm font-black uppercase tracking-[0.12em] text-white">
        Total
      </span>

      <span className="text-xl font-black text-[#e7cfaa]">
        {total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </span>
    </div>
  </div>
</div>
    async function calcularFrete(
  cepInformado: string,
  itensInformados: ItemCarrinho[] = itens
) {
  const cepLimpo = cepInformado.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    setErroFrete("Informe um CEP válido com 8 dígitos.");
    return;
  }

  try {
    setCalculandoFrete(true);
    setErroFrete("");
    setFretes([]);
    setFreteSelecionado(null);
    localStorage.removeItem("rockaholic-frete");

    const totalItens = itensInformados.reduce(
  (soma, item) => soma + item.quantidade,
  0
);

    const resposta = await fetch(
      "/api/melhor-envio/calcular-frete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cepDestino: cepLimpo,
          quantidade: totalItens,
        }),
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro || "Não foi possível calcular o frete."
      );
    }

    const opcoesValidas = resultado.fretes.filter(
      (opcao: any) => opcao.price && !opcao.error
    );

    setFretes(opcoesValidas);
  } catch (error) {
    console.error(error);
    setErroFrete("Não foi possível calcular o frete para este CEP.");
  } finally {
    setCalculandoFrete(false);
  }
}
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
                <div className="mb-5 border-b border-white/10 pb-5">
  <p className="text-xs font-black uppercase tracking-[0.15em] text-white">
    Calcular entrega
  </p>

  <div className="mt-3 flex gap-2">
    <input
      type="text"
      value={cep}
      maxLength={9}
      placeholder="00000-000"
      onChange={(event) => {
  const valor = event.target.value;

  setCep(valor);

  const cepLimpo = valor.replace(/\D/g, "");

  if (cepLimpo.length === 8) {
    calcularFrete(valor);
  }
}}
      className="min-w-0 flex-1 border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-red-700"
    />

    <button
      type="button"      
      onClick={() => calcularFrete(cep)}
      disabled={calculandoFrete}
      className="bg-red-700 px-4 py-3 text-xs font-black uppercase text-white transition hover:bg-red-800 disabled:opacity-50"
    >
      {calculandoFrete ? "..." : "Calcular"}
    </button>
  </div>

  {erroFrete && (
    <p className="mt-2 text-xs font-bold text-red-500">
      {erroFrete}
    </p>
  )}
  {/* OPÇÕES DE ENTREGA */}
{!calculandoFrete && cep.replace(/\D/g, "").length === 8 && (
  <div className="mt-4 space-y-2">

    {/* RETIRADA NO LOCAL */}
    <button
      type="button"
      onClick={() => {
        const novoFrete = {
          cep: cep.replace(/\D/g, ""),
          id: "retirada-local",
          nome: "Retirada no local",
          empresa: "Rock-a-Holic Store",
          preco: 0,
          prazo: 0,
        };

        setFreteSelecionado(novoFrete);

        localStorage.setItem(
          "rockaholic-frete",
          JSON.stringify(novoFrete)
        );
      }}
      className={`w-full border p-3 text-left transition ${
        freteSelecionado?.id === "retirada-local"
          ? "border-red-600 bg-red-950/20"
          : "border-white/10 bg-black hover:border-red-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-white">
            Retirada no local
          </p>

          <p className="mt-1 text-[10px] text-neutral-400">
            Retire conosco após a produção.
          </p>
        </div>

        <span className="text-xs font-black text-[#e7cfaa]">
          Grátis
        </span>
      </div>
    </button>

    {/* TRANSPORTADORAS */}
    {fretes.map((opcao: any) => {
      const preco = Number(
        opcao.custom_price || opcao.price || 0
      );

      const prazo =
        opcao.custom_delivery_time ||
        opcao.delivery_time ||
        null;

      const empresa =
        opcao.company?.name || "";

      return (
        <button
          key={opcao.id}
          type="button"
          onClick={() => {
            const novoFrete = {
              cep: cep.replace(/\D/g, ""),
              id: opcao.id,
              nome: opcao.name,
              empresa,
              preco,
              prazo,
            };

            setFreteSelecionado(novoFrete);

            localStorage.setItem(
              "rockaholic-frete",
              JSON.stringify(novoFrete)
            );
          }}
          className={`w-full border p-3 text-left transition ${
            freteSelecionado?.id === opcao.id
              ? "border-red-600 bg-red-950/20"
              : "border-white/10 bg-black hover:border-red-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black text-white">
                {empresa
                  ? `${empresa} - ${opcao.name}`
                  : opcao.name}
              </p>

              <p className="mt-1 text-[10px] text-neutral-400">
                Produção: até 2 dias úteis

                {prazo !== null && (
                  <>
                    <br />
                    Transporte: {prazo} dia(s)
                  </>
                )}
              </p>
            </div>

            <span className="shrink-0 text-xs font-black text-[#e7cfaa]">
              {preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </button>
      );
    })}
  </div>
)}

</div>
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
  href={freteSelecionado ? "/checkout" : "#"}
  onClick={(event) => {
    if (!freteSelecionado) {
      event.preventDefault();
      setErroFrete(
        "Selecione uma forma de entrega antes de finalizar a compra."
      );
      return;
    }

    setAberto(false);
  }}
  className={`block w-full px-5 py-4 text-center text-xs font-black uppercase tracking-[0.15em] transition ${
    freteSelecionado
      ? "bg-red-700 text-white hover:bg-red-800"
      : "cursor-not-allowed bg-neutral-800 text-neutral-500"
  }`}
>
  Finalizar compra
</Link>
                

                <Link
                  href="/carrinho"
                  onClick={() => setAberto(false)}
                  className="block w-full border border-white/20 bg-black px-5 py-4 text-center text-xs font-black uppercase tracking-[0.15em] text-white transition hover:border-white/40"
                >
                  Ver carrinho
                </Link>

                <Link
  href="/#loja"
  onClick={() => setAberto(false)}
  className="block w-full px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.15em] text-neutral-300 transition hover:text-white"
>
  Continuar comprando
</Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}