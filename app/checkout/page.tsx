"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type ItemCarrinho = {
  nome: string;
  preco: string;
  tamanho: string;
  quantidade: number;
};

export default function CheckoutPage() {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const [dados, setDados] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
const [gerandoPix, setGerandoPix] = useState(false);
const [erroPagamento, setErroPagamento] = useState("");
const [pix, setPix] = useState<{
  orderId: string;
  status: string;
  qrCode: string | null;
  ticketUrl: string | null;
} | null>(null);

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [frete, setFrete] = useState<{
  cep: string;
  id: number;
  nome: string;
  empresa: string;
  preco: number;
  prazo: number | null;
} | null>(null);

  useEffect(() => {
  const carrinhoSalvo = localStorage.getItem("rockaholic-carrinho");
  const freteSalvo = localStorage.getItem("rockaholic-frete");

  if (carrinhoSalvo) {
    setItens(JSON.parse(carrinhoSalvo));
  }

  if (freteSalvo) {
    setFrete(JSON.parse(freteSalvo));
  }
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

  const subtotal = itens.reduce((soma, item) => {
    return soma + converterPreco(item.preco) * item.quantidade;
  }, 0);

  const valorFrete = frete?.preco || 0;

  const total = subtotal + valorFrete;

  function atualizarCampo(
    campo: keyof typeof dados,
    valor: string
  ) {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  }

  async function buscarCep(cepDigitado: string) {
  const cepLimpo = cepDigitado.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return;
  }

  try {
    setBuscandoCep(true);
    setErroCep("");

    const resposta = await fetch(
      `https://viacep.com.br/ws/${cepLimpo}/json/`
    );

    const endereco = await resposta.json();

    if (endereco.erro) {
      setErroCep("CEP não encontrado.");
      return;
    }

    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      endereco: endereco.logradouro || "",
      bairro: endereco.bairro || "",
      cidade: endereco.localidade || "",
      estado: endereco.uf || "",
    }));
  } catch {
    setErroCep(
      "Não foi possível consultar o CEP. Tente novamente."
    );
  } finally {
    setBuscandoCep(false);
  }
}

  async function finalizarCheckout(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (itens.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  if (!frete) {
    alert("Nenhuma forma de entrega foi selecionada.");
    return;
  }

  try {
    setGerandoPix(true);
    setErroPagamento("");

    const resposta = await fetch("/api/mercado-pago/pix", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valor: total,
      }),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Não foi possível gerar o pagamento Pix."
      );
    }

    setPix({
      orderId: resultado.orderId,
      status: resultado.status,
      qrCode: resultado.qrCode,
      ticketUrl: resultado.ticketUrl,
    });
  } catch (error) {
    console.error(error);

    setErroPagamento(
      error instanceof Error
        ? error.message
        : "Não foi possível gerar o pagamento Pix."
    );
  } finally {
    setGerandoPix(false);
  }
}

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/carrinho"
          className="inline-flex border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-300 transition hover:border-red-700 hover:bg-red-700 hover:text-white"
        >
          ← Voltar ao carrinho
        </Link>

        <div className="mt-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
            Rock-a-Holic Store
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Finalizar compra
          </h1>
        </div>

        <form
          onSubmit={finalizarCheckout}
          className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-8">
            <section className="border border-white/10 bg-neutral-950 p-7">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                01 — Identificação
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Nome completo
                  </label>

                  <input
                    type="text"
                    required
                    value={dados.nome}
                    onChange={(event) =>
                      atualizarCampo("nome", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    E-mail
                  </label>

                  <input
                    type="email"
                    required
                    value={dados.email}
                    onChange={(event) =>
                      atualizarCampo("email", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Telefone
                  </label>

                  <input
                    type="tel"
                    required
                    value={dados.telefone}
                    onChange={(event) =>
                      atualizarCampo("telefone", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-neutral-950 p-7">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
                02 — Entrega
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    CEP
                  </label>

                 <input
  type="text"
  required
  maxLength={9}
  value={dados.cep}
  onChange={(event) => {
    const valor = event.target.value;

    atualizarCampo("cep", valor);

    const cepLimpo = valor.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      buscarCep(valor);
    }
  }}
  placeholder="00000-000"
  className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
/>

{buscandoCep && (
  <p className="mt-2 text-xs text-neutral-500">
    Buscando endereço...
  </p>
)}

{erroCep && (
  <p className="mt-2 text-xs font-bold text-red-500">
    {erroCep}
  </p>
)}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Número
                  </label>

                  <input
                    type="text"
                    required
                    value={dados.numero}
                    onChange={(event) =>
                      atualizarCampo("numero", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Endereço
                  </label>

                  <input
                    type="text"
                    required
                    value={dados.endereco}
                    onChange={(event) =>
                      atualizarCampo("endereco", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Bairro
                  </label>

                  <input
                    type="text"
                    required
                    value={dados.bairro}
                    onChange={(event) =>
                      atualizarCampo("bairro", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Cidade
                  </label>

                  <input
                    type="text"
                    required
                    value={dados.cidade}
                    onChange={(event) =>
                      atualizarCampo("cidade", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Estado
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={dados.estado}
                    onChange={(event) =>
                      atualizarCampo(
                        "estado",
                        event.target.value.toUpperCase()
                      )
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 uppercase outline-none focus:border-red-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
                    Complemento
                  </label>

                  <input
                    type="text"
                    value={dados.complemento}
                    onChange={(event) =>
                      atualizarCampo("complemento", event.target.value)
                    }
                    className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit border border-white/10 bg-neutral-950 p-7">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-600">
              Resumo do pedido
            </p>

            <div className="mt-6 space-y-5">
              {itens.map((item, index) => (
                <div
                  key={`${item.nome}-${item.tamanho}-${index}`}
                  className="border-b border-white/10 pb-5"
                >
                  <p className="font-bold">
                    {item.nome}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Tamanho {item.tamanho} · Qtd. {item.quantidade}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
  <div className="flex justify-between">
    <span className="text-neutral-400">Subtotal</span>

    <span>
      {subtotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </span>
  </div>

  <div className="flex justify-between gap-4">
    <div>
      <span className="text-neutral-400">Frete</span>

      {frete && (
        <p className="mt-1 text-xs text-neutral-500">
          {frete.empresa
          ? `${frete.empresa} - ${frete.nome}`
          : frete.nome}

          {frete.prazo !== null && (
           <>
       {" • "}
       {frete.prazo} dia(s)
  </>
)}
        </p>
      )}
    </div>

    <span>
      {frete
    ? frete.preco === 0
    ? "Grátis"
    : valorFrete.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
  : "Não selecionado"}
    </span>
  </div>

  <div className="flex items-end justify-between border-t border-white/10 pt-4">
    <span className="font-bold uppercase">Total</span>

    <span className="text-2xl font-black text-[#e7cfaa]">
      {total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </span>
  </div>
</div>

<button
  type="submit"
  className="mt-7 w-full bg-red-700 px-6 py-5 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800"
>
  Continuar para pagamento
          </button>
          </aside>
        </form>
      </div>
    </main>
  );
}