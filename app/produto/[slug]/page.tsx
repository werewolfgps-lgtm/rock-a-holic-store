import ProductDetails from "@/components/ProductDetails";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const produtos = [
  {
    nome: "Charlie Brown Jr.",
    categoria: "Bandas",
    preco: "R$ 69,90",
    imagem: "/produtos/cbjr.png",
    slug: "charlie-brown-jr",
    descricao:
      "Camiseta inspirada em uma das bandas mais marcantes do rock nacional.",
  },
  {
    nome: "Raimundos",
    categoria: "Rock Nacional",
    preco: "R$ 69,90",
    imagem: "/produtos/raimundos.png",
    slug: "raimundos",
    descricao:
      "Uma estampa com atitude para quem carrega o rock nacional no peito.",
  },
  {
    nome: "Guns N' Roses",
    categoria: "Rock Internacional",
    preco: "R$ 69,90",
    imagem: "/produtos/gnr.png",
    slug: "guns-n-roses",
    descricao:
      "Camiseta para fãs de um dos maiores nomes do hard rock mundial.",
  },
  {
    nome: "Kiss",
    categoria: "Rock Internacional",
    preco: "R$ 69,90",
    imagem: "/produtos/kiss.png",
    slug: "kiss",
    descricao:
      "Uma peça inspirada na estética e na atitude inconfundível do Kiss.",
  },
];

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const produto = produtos.find(
    (item) => item.slug === slug
  );

  if (!produto) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 transition hover:text-red-500"
        >
          ← Voltar para a loja
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {/* IMAGEM */}
          <div className="relative aspect-square overflow-hidden bg-[#f2f2f2]">
            <Image
              src={produto.imagem}
              alt={`Camiseta ${produto.nome}`}
              fill
              priority
              className="object-contain p-6"
            />
          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              {produto.categoria}
            </p>

            <h1 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              {produto.nome}
            </h1>

            <p className="mt-6 text-3xl font-bold text-[#e7cfaa]">
              {produto.preco}
            </p>

            <p className="mt-7 max-w-xl leading-8 text-neutral-400">
              {produto.descricao}
            </p>

            {/* TAMANHOS */}
            <ProductDetails
              nome={produto.nome}
              preco={produto.preco}
              imagem={produto.imagem}
              slug={produto.slug}
            />

            {/* DETALHES */}
            <div className="mt-10 border-t border-white/10 pt-7">
              <div className="space-y-3 text-sm text-neutral-400">
                <p>• Camiseta unissex</p>
                <p>• Estampa em alta definição</p>
                <p>• Tamanhos P, M, G e GG</p>
                <p>• Produto Rock-a-Holic Store</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}