import type React from "react";
import type { Metadata } from "next";
import { MobileNav, SidebarNav } from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = { title: "InventarioPRO", description: "Portal de Gestão de Ativos de TI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-slate-100">
          <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 border-r border-slate-800 bg-slate-950 text-white shadow-xl lg:flex lg:flex-col">
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">InventarioPRO</p>
              <h1 className="mt-2 text-2xl font-bold">Gestão de Ativos</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">Governança, inventário e rastreabilidade de TI.</p>
            </div>
            <SidebarNav />
            <div className="mt-auto border-t border-white/10 p-6">
              <p className="font-semibold text-white">Inventário Pro</p>
              <p className="text-sm text-slate-400">Versão MVP</p>
            </div>
          </aside>
          <main className="min-h-screen lg:ml-72">
            <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Portal de Governança de Ativos de TI</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">Controle patrimonial, movimentações e rastreabilidade operacional.</h2>
              <MobileNav />
            </header>
            <section className="p-5 sm:p-8">{children}</section>
          </main>
        </div>
      </body>
    </html>
  );
}
