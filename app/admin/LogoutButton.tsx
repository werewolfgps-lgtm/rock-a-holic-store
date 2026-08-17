"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    try {
      setSaindo(true);

      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.push("/admin");
      router.refresh();
    } finally {
      setSaindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-neutral-400 transition hover:border-red-600 hover:text-white disabled:opacity-50"
    >
      {saindo ? "Saindo..." : "Sair"}
    </button>
  );
}