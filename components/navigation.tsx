"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Ativos", href: "/ativos", icon: "▣" },
  { label: "Pessoas", href: "/pessoas", icon: "◉" },
  { label: "Localizações", href: "/localizacoes", icon: "⌖" },
  { label: "Movimentações", href: "/movimentacoes", icon: "⇄" },
  { label: "Termos", href: "/termos", icon: "◫" },
  { label: "Auditoria", href: "/auditoria", icon: "◎" },
  { label: "Configurações", href: "/configuracoes", icon: "⚙" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-4">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active ? "bg-cyan-400/15 text-white ring-1 ring-cyan-300/30" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`grid size-8 place-items-center rounded-xl ${active ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-cyan-200"}`}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>
            {item.icon} {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
