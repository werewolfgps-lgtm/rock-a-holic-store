"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Produto = {
  id: number;
  nome: string;
  slug: string;
  preco: number;
  descricao: string | null;
  imagem_url: string | null;
  imagens: string[];
  ativo: boolean;
  tamanhos: string[];
  modelagem: string | null;
};

export default function EditarProdutoForm({
  produto,
}: {
  produto: Produto;
}) {
  const router = useRouter();

  const [nome, setNome] = useState(produto.nome);
  const [slug, setSlug] = useState(produto.slug);
  const [preco, setPreco] = useState(
    Number(produto.preco).toFixed(2)
  );
  const [descricao, setDescricao] = useState(
    produto.descricao || ""
  );
  const [imagemUrl, setImagemUrl] = useState( produto.imagem_url || "");
  const [imagemArquivo, setImagemArquivo] =
    useState<File | null>(null);
    const [imagensArquivos, setImagensArquivos] =
              useState<File[]>([]);

   const [imagensPreview, setImagensPreview] =
                  useState<string[]>([]);

   const [imagensExistentes, setImagensExistentes] =
               useState<string[]>(produto.imagens || []);
              
  const [ativo, setAtivo] = useState(produto.ativo);
  const [tamanhos, setTamanhos] = useState(
    produto.tamanhos || []
  );
  const [modelagem, setModelagem] = useState(
  produto.modelagem || ""
);

  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] =
    useState(false);
  const [erro, setErro] = useState("");

  function alternarTamanho(tamanho: string) {
    setTamanhos((atuais) =>
      atuais.includes(tamanho)
        ? atuais.filter((item) => item !== tamanho)
        : [...atuais, tamanho]
    );
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

  async function salvar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSalvando(true);
      setErro("");

      const imagemFinal = await enviarImagem();
      const novasImagens = await enviarImagensAdicionais();

      const imagensFinais = [
          ...imagensExistentes,
          ...novasImagens,
          ];

      const resposta = await fetch(
        `/api/admin/produtos/${produto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          nome,
          slug,
          preco,
          descricao,
          imagemUrl: imagemFinal,
          imagens: imagensFinais,
           ativo,
           tamanhos,
            modelagem,
           }),
           }
          );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          resultado.erro ||
            "Não foi possível atualizar o produto."
        );
      }

      router.push("/admin/produtos");
      router.refresh();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o produto."
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
          onChange={(event) =>
            setNome(event.target.value)
          }
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
            setSlug(event.target.value)
          }
          className="mt-2 w-full border border-white/10 bg-black px-4 py-4 outline-none focus:border-red-700"
        />
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

      <div>
        <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Imagem principal
        </label>

        {imagemUrl && (
          <div className="mt-3 border border-white/10 bg-black p-4">
            <img
              src={imagemUrl}
              alt={nome}
              className="mx-auto max-h-80 object-contain"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const arquivo =
              event.target.files?.[0] || null;
              
            setImagemArquivo(arquivo);

            if (arquivo) {
              setImagemUrl(
                URL.createObjectURL(arquivo)
              );
            }
          }}
          className="mt-4 block w-full border border-white/10 bg-black px-4 py-4 text-sm text-neutral-300"
        />
        </div>
        
{/* GALERIA DE IMAGENS */}
<div>
  <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
    Imagens adicionais
  </label>

  <p className="mt-2 text-xs text-neutral-500">
    Selecione outras fotos para a galeria do produto.
  </p>

  {imagensExistentes.length > 0 && (
  <div className="mt-4">
    <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-500">
      Imagens atuais
    </p>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {imagensExistentes.map((imagem, index) => (
        <div
          key={`${imagem}-${index}`}
          className="relative border border-white/10 bg-black p-2"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={imagem}
              alt={`Imagem atual ${index + 1}`}
              className="h-full w-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setImagensExistentes((atuais) =>
                atuais.filter((_, i) => i !== index)
              )
            }
            className="mt-2 w-full border border-red-700 px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-red-500 transition hover:bg-red-700 hover:text-white"
          >
            Remover
          </button>
        </div>
      ))}
    </div>
  </div>
)}

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(event) => {
      const novosArquivos = Array.from(
        event.target.files || []
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

      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-neutral-400">
          Tamanhos disponíveis
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {(
  modelagem === "feminina"
    ? ["P", "M", "G", "GG", "G1", "G2"]
    : ["P", "M", "G", "GG", "G1", "G2", "G3", "G4"]
).map((tamanho) => (
            <button
              key={tamanho}
              type="button"
              onClick={() =>
                alternarTamanho(tamanho)
              }
              className={`h-12 w-12 border text-sm font-black ${
                tamanhos.includes(tamanho)
                  ? "border-red-600 bg-red-700"
                  : "border-white/10 text-neutral-400"
              }`}
            >
              {tamanho}
            </button>
          ))}
        </div>
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
            : "Salvar alterações"}
      </button>
    </form>
  );
}