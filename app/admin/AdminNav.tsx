"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const emProdutos = pathname.startsWith("/admin/produtos");
  const emPedidos = !emProdutos;

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-3 border-b border-white/10 pb-5">
      <Link
        href="/admin"
        className={`border px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
          emPedidos
            ? "border-red-700 bg-red-700 text-white"
            : "border-white/20 text-neutral-400 hover:border-white/50 hover:text-white"
        }`}
      >
        Pedidos
      </Link>

      <Link
        href="/admin/produtos"
        className={`border px-5 py-3 text-xs font-black uppercase tracking-[0.18em] transition ${
          emProdutos
            ? "border-red-700 bg-red-700 text-white"
            : "border-white/20 text-neutral-400 hover:border-white/50 hover:text-white"
        }`}
      >
        Produtos
      </Link>
    </nav>
  );
}