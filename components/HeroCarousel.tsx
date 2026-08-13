"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "ROCK NÃO É SÓ MÚSICA",
    title: "VISTA SUA",
    highlight: "ATITUDE.",
    description:
      "Camisetas para quem carrega o rock na música, no estilo e na personalidade.",
    button: "CONHEÇA A COLEÇÃO",
    link: "#loja",
    image: "/banners/banner-01.png",
  },
  {
    eyebrow: "ROCK-A-HOLIC STORE",
    title: "NOVAS ESTAMPAS.",
    highlight: "MESMA ATITUDE.",
    description:
      "Novos designs para quem transforma música em identidade.",
    button: "VER NOVIDADES",
    link: "#loja",
    image: "/banners/banner-02.png",
  },
  {
    eyebrow: "WEAR THE NOISE",
    title: "NÃO ESCUTE.",
    highlight: "VIVA O ROCK.",
    description:
      "Vista aquilo que faz parte da sua história.",
    button: "VER COLEÇÕES",
    link: "#colecoes",
    image: "/banners/banner-03.png",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[current];

  return (
    <section className="relative min-h-[650px] overflow-hidden bg-black">
      {/* IMAGEM */}
      <div
       className="absolute inset-0 bg-cover bg-[center_30%] transition-all duration-700"
        style={{
          backgroundImage: `url(${slide.image})`,
        }}
      />

      {/* SOMBREAMENTO */}
     <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      {/* CONTEÚDO */}
      <div className="relative z-10 mx-auto flex min-h-[650px] max-w-7xl items-center px-6">
        <div className="max-w-2xl">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.4em] text-red-600 sm:text-sm">
            {slide.eyebrow}
          </p>

          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-[#e7cfaa] sm:text-6xl md:text-7xl">
            {slide.title}

            <span className="mt-2 block text-red-700">
              {slide.highlight}
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-neutral-300 sm:text-lg">
            {slide.description}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={slide.link}
              className="bg-red-700 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white transition hover:bg-red-800"
            >
              {slide.button}
            </a>

            <a
              href="#sobre"
              className="border border-[#e7cfaa]/60 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-[#e7cfaa] transition hover:bg-[#e7cfaa] hover:text-black"
            >
              Nossa história
            </a>
          </div>
        </div>
      </div>

      {/* SETA ESQUERDA */}
      <button
        onClick={previousSlide}
        aria-label="Slide anterior"
        className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 border border-white/20 bg-black/40 px-4 py-3 text-2xl text-white transition hover:border-red-700 hover:bg-red-700 md:block"
      >
        ‹
      </button>

      {/* SETA DIREITA */}
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 border border-white/20 bg-black/40 px-4 py-3 text-2xl text-white transition hover:border-red-700 hover:bg-red-700 md:block"
      >
        ›
      </button>

      {/* INDICADORES */}
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Ir para slide ${index + 1}`}
            className={`h-[3px] transition-all duration-300 ${
              current === index
                ? "w-12 bg-red-700"
                : "w-7 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}