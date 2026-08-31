"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoProdutoForm() {
  const router = useRouter();

  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [modelagem, setModelagem] = useState("");
  const [tamanhos, setTamanhos] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [imagensArquivos, setImagensArquivos] =  useState<File[]>([]);
  const [imagensPreview, setImagensPreview] =  useState<string[]>([]);

  function alternarTamanho(tamanho: string) {
    setTamanhos((atuais) =>
      atuais.includes(tamanho)
        ? atuais.filter((item) => item !== tamanho)
        : [...atuais, tamanho]
    );
  }

  function gerarSlug(valor: string) {
    return valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function enviarImagem() {
  if (!imagemArquivo) {
    return imagemUrl;
  }

  try {
    setEnviandoImagem(true);

    const formData = new FormData();
    formData.append("arquivo", imagemArquivo);

    const resposta = await fetch(
      "/api/admin/produtos/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Não foi possível enviar a imagem."
      );
    }

    setImagemUrl(resultado.url);

    return resultado.url;
  } finally {
    setEnviandoImagem(false);
  }
}

async function enviarImagensAdicionais() {
  if (imagensArquivos.length === 0) {
    return [];
  }

  const urls: string[] = [];

  for (const arquivo of imagensArquivos) {
    const formData = new FormData();

    formData.append("arquivo", arquivo);

    const resposta = await fetch(
      "/api/admin/produtos/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          "Não foi possível enviar uma das imagens adicionais."
      );
    }

    urls.push(resultado.url);
  }

  return urls;
}

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");
      
      const imagemFinal = await enviarImagem();
      const imagensFinais =
       await enviarImagensAdicionais();

      const resposta = await fetch(
        "/api/admin/produtos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            slug,
            preco,
            descricao,
            imagemUrl: imagemFinal,
            ativo,
            modelagem,
            tamanhos,
            imagens: imagensFinais,
          }),
        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro ||
            "Não foi possível cadastrar o produto."
        );
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="mt-10 space-y-7 border border-white/10 bg-neutral-950 p-7"
    >
      <div>
        <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Nome do produto
        </label>

        <input
          type="text"
          required
          value={nome}
          onChange={(event) => {
            const valor = event.target.value;
            setNome(valor);

            if (!slug) {
              setSlug(gerarSlug(valor));
            }
          }}
          className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Slug
        </label>

        <input
          type="text"
          required
          value={slug}
          onChange={(event) =>
            setSlug(gerarSlug(event.target.value))
          }
          className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
        />

        <p className="mt-2 text-xs text-neutral-600">
          Ex.: guns-n-roses
        </p>
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Preço
        </label>

        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={preco}
          onChange={(event) =>
            setPreco(event.target.value)
          }
          placeholder="69.90"
          className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
        />
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Descrição
        </label>

        <textarea
          value={descricao}
          onChange={(event) =>
            setDescricao(event.target.value)
          }
          className="mt-2 min-h-32 w-full resize-y border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
        />
      </div>

          {/* IMAGEM PRINCIPAL */}
            <div>
           <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
             Imagem principal
           </label>
          
 <input
  type="file"
  accept="image/*"
  multiple
  onChange={(event) => {
    const novosArquivos = Array.from(
      event.target.files || []
    );
    
    console.log(
  "IMAGENS SELECIONADAS:",
  novosArquivos.length,
  novosArquivos.map((arquivo) => arquivo.name)
);

    if (novosArquivos.length === 0) {
      return;
    }

    setImagensArquivos((atuais) => [
      ...atuais,
      ...novosArquivos,
    ]);

    const novosPreviews = novosArquivos.map(
      (arquivo) => URL.createObjectURL(arquivo)
    );

    setImagensPreview((atuais) => [
      ...atuais,
      ...novosPreviews,
    ]);

    event.target.value = "";
  }}
  className="mt-3 block w-full border border-white/10 bg-black px-4 py-4 text-sm text-neutral-300"
/>



  {imagensPreview.length > 0 && (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {imagensPreview.map((imagem, index) => (
  <div
    key={`${imagem}-${index}`}
    className="relative border border-white/10 bg-black p-2"
  >
    <div className="aspect-square overflow-hidden">
      <img
        src={imagem}
        alt={`Imagem adicional ${index + 1}`}
        className="h-full w-full object-contain"
      />
    </div>

    <button
      type="button"
      onClick={() => {
        URL.revokeObjectURL(imagem);

        setImagensPreview((atuais) =>
          atuais.filter((_, i) => i !== index)
        );

        setImagensArquivos((atuais) =>
          atuais.filter((_, i) => i !== index)
        );
      }}
      className="mt-2 w-full border border-red-700 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-red-500 transition hover:bg-red-700 hover:text-white"
    >
      Remover
    </button>
  </div>
))}
    </div>
  )}
</div>

{/* MODELAGEM */}
<div>
  <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
    Modelagem
  </p>

  <div className="mt-3 grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setModelagem("masculina")}
      className={`border px-5 py-4 text-sm font-black uppercase transition ${
        modelagem === "masculina"
          ? "border-red-600 bg-red-700 text-white"
          : "border-white/10 bg-black text-neutral-400 hover:border-white/30"
      }`}
    >
      Masculina
    </button>

    <button
      type="button"
      onClick={() => {
  setModelagem("feminina");

  setTamanhos((atuais) =>
    atuais.filter(
      (tamanho) =>
        tamanho !== "G3" &&
        tamanho !== "G4"
    )
  );
}}
      className={`border px-5 py-4 text-sm font-black uppercase transition ${
        modelagem === "feminina"
          ? "border-red-600 bg-red-700 text-white"
          : "border-white/10 bg-black text-neutral-400 hover:border-white/30"
      }`}
    >
      Feminina
    </button>
  </div>
</div>

{/* TAMANHOS DISPONÍVEIS */}
<div>
  <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
    Tamanhos disponíveis
  </p>

  {!modelagem ? (
    <p className="mt-3 text-sm text-neutral-500">
      Selecione primeiro a modelagem.
    </p>
  ) : (
    <div className="mt-3 flex flex-wrap gap-3">
      {(modelagem === "feminina"
        ? ["P", "M", "G", "GG", "G1", "G2"]
        : ["P", "M", "G", "GG", "G1", "G2", "G3", "G4"]
      ).map((tamanho) => (
        <button
          key={tamanho}
          type="button"
          onClick={() => alternarTamanho(tamanho)}
          className={`h-12 min-w-12 border px-3 text-sm font-black transition ${
            tamanhos.includes(tamanho)
              ? "border-red-600 bg-red-700 text-white"
              : "border-white/10 bg-black text-neutral-400 hover:border-white/30"
          }`}
        >
          {tamanho}
        </button>
      ))}
    </div>
  )}
</div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(event) =>
            setAtivo(event.target.checked)
          }
        />

        <span className="text-sm font-bold">
          Produto ativo na loja
        </span>
      </label>

      {erro && (
        <p className="text-sm font-bold text-red-500">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando || enviandoImagem}
        className="w-full bg-red-700 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] transition hover:bg-red-800 disabled:opacity-50"
      >
        {enviandoImagem
            ? "Enviando imagem..."
             : salvando
             ? "Salvando..."
                : "Salvar produto"}
      </button>
    </form>
  );
}