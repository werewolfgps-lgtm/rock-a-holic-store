import Image from "next/image";
import HeroCarousel from "@/components/HeroCarousel";
import CartButton from "@/components/CartButton";
import { neon } from "@neondatabase/serverless";

type Produto = {
  id: number;
  nome: string;
  categoria: string | null;
  preco: number;
  imagem_url: string | null;
  slug: string;
};

export default async function Home() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
  }

  const sql = neon(databaseUrl);

  const produtos = (await sql`
    SELECT
      id,
      nome,
      categoria,
      preco,
      imagem_url,
      slug
    FROM produtos
    WHERE ativo = TRUE
    ORDER BY id DESC
  `) as Produto[];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
<div className="flex items-center">
  <Image
    src="/logo/logo-principal.png"
    alt="Rock-a-Holic Store"
    width={210}
    height={180}
    priority
    className="h-auto w-[175px] sm:w-[200px]"
  />
</div>

         <nav className="hidden items-center gap-10 text-xs font-bold uppercase tracking-[0.15em] md:flex">
            <a className="transition hover:text-red-500" href="#">
              Início
            </a>
            <a className="transition hover:text-red-500" href="#loja">
              Loja
            </a>
            <a className="transition hover:text-red-500" href="#colecoes">
              Coleções
            </a>
            <a className="transition hover:text-red-500" href="#sobre">
              Sobre
            </a>
          </nav>
          <CartButton />
        </div>
      </header>

      {/* HERO */}
<HeroCarousel />

      {/* FRASE DA MARCA */}
      <section className="border-y border-white/10 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center">
          <p className="text-xl font-black uppercase tracking-wide sm:text-3xl">
            É atitude. <span className="text-red-600">É liberdade.</span> É
            identidade.
          </p>
        </div>
      </section>

      {/* PRODUTOS */}
      <section id="loja" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Destaques
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase">
              DESTAQUES DA ROCK-A-HOLIC
            </h2>
          </div>
          <a
            href="#"
            className="text-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-white"
          >
            Ver toda a loja →
          </a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {produtos.map((produto) => (
            <article key={produto.id} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f2f2f2] p-3">
  <Image
    src={produto.imagem_url || "/logo/logo-principal.png"}
    alt={`Camiseta ${produto.nome}`}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    className="object-contain p-1 transition duration-500 group-hover:scale-[1.02]"
  />
</div>

              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-red-500">
                {produto.categoria || "Rock-a-Holic"}
              </p>

              <h3 className="mt-2 text-xl font-bold">{produto.nome}</h3>

              <p className="mt-2 font-semibold text-neutral-400">
  {Number(produto.preco).toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
})}
</p>

<a
  href={`/produto/${produto.slug}`}
  className="mt-5 inline-flex w-full items-center justify-center border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[0.15em] transition hover:border-red-700 hover:bg-red-700"
>
  Ver produto
</a>

</article>
          ))}
        </div>
      </section>

      {/* COLEÇÕES */}
      <section id="colecoes" className="bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
            Escolha seu estilo
          </p>

          <h2 className="mt-3 text-4xl font-black uppercase">
            Nossas coleções
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {["Guitarras", "Rock Classics", "Autorais"].map((colecao) => (
              <div
                key={colecao}
                className="group flex min-h-64 items-end border border-white/10 bg-black p-7 transition hover:border-red-600"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
                    Rock-a-Holic
                  </p>
                  <h3 className="mt-2 text-3xl font-black uppercase transition group-hover:text-red-500">
                    {colecao}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-500">
              Sobre a marca
            </p>

            <h2 className="mt-4 text-4xl font-black uppercase sm:text-5xl">
              Somos
              <span className="block text-red-600">Rock-a-Holic.</span>
            </h2>
          </div>

          <div className="space-y-5 text-lg leading-8 text-neutral-400">
            <p>
              Para quem não apenas escuta rock. Para quem vive rock.
            </p>

            <p>
              A Rock-a-Holic Store nasceu para transformar essa paixão em
              identidade, criando camisetas que carregam música, atitude e
              personalidade.
            </p>

            <p className="font-bold text-white">
              Vista o som. Vista sua história.
            </p>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-y border-white/10 bg-red-700">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-black uppercase sm:text-4xl">
            Entre para o Rock-a-Holic Club
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-red-100">
            Novas coleções, lançamentos e novidades direto para você.
          </p>

          <div className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 bg-white px-5 py-4 text-black outline-none"
            />

            <button className="bg-black px-7 py-4 font-black uppercase tracking-wider text-white">
              Quero entrar
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="text-xl font-black tracking-widest">
              ROCK-A-HOLIC
            </p>
            <p className="mt-4 text-sm text-neutral-500">
              É atitude. É liberdade. É identidade.
            </p>
          </div>

          <div>
            <p className="font-bold uppercase">Navegue</p>
            <div className="mt-4 space-y-2 text-sm text-neutral-500">
              <p>Loja</p>
              <p>Coleções</p>
              <p>Sobre nós</p>
              <p>Contato</p>
            </div>
          </div>

          <div>
            <p className="font-bold uppercase">Siga a Rock-a-Holic</p>
            <p className="mt-4 text-sm text-neutral-500">Instagram</p>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-7 text-center text-xs text-neutral-600">
          © 2026 Rock-a-Holic Store. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}