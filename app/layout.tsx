import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "InventarioPRO", description: "Portal de Gestão de Ativos de TI" };

const nav = ["Dashboard", "Ativos", "Pessoas", "Localizações", "Movimentações", "Termos", "Auditoria", "Configurações"].map((label) => ({ label, href: label === "Dashboard" ? "/" : `/${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("ç", "c")}` }));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body><div className="min-h-screen"><aside className="fixed inset-y-0 left-0 z-10 w-72 border-r border-slate-200 bg-slate-950 text-white"><div className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">InventarioPRO</p><h1 className="mt-2 text-2xl font-bold">Gestão de Ativos</h1></div><nav className="px-4">{nav.map((item) => <Link key={item.href} href={item.href} className="mb-1 block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white">{item.label}</Link>)}</nav></aside><main className="ml-72 min-h-screen"><header className="border-b border-slate-200 bg-white px-8 py-5"><p className="text-sm text-slate-500">Portal administrativo</p><h2 className="text-2xl font-semibold">Controle patrimonial de TI</h2></header><section className="p-8">{children}</section></main></div></body></html>;
}
