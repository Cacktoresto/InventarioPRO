import type React from "react";
export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>{description ? <p className="mt-2 text-slate-600">{description}</p> : null}</div>{action}</div>;
}
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>; }
export function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">{text}</div>; }
export function Button({ children }: { children: React.ReactNode }) { return <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">{children}</button>; }
