import Link from "next/link";
import type React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
};

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Inventário Pro</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}</div>{action ? <div className="flex shrink-0 gap-2">{action}</div> : null}</div>;
}
export const PageTitle = PageHeader;

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}>{children}</section>; }
export function EmptyState({ title = "Nenhum registro", text }: { title?: string; text: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><p className="font-semibold text-slate-800">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div>; }
export function Alert({ status, message }: { status?: string; message: string }) { const isError = status === "error"; return <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p>; }
export function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) { return <button {...props} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${buttonStyles[variant]} ${props.className ?? ""}`}>{children}</button>; }
export function ButtonLink({ children, href, variant = "primary" }: { children: React.ReactNode; href: string; variant?: ButtonVariant }) { return <Link href={href} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${buttonStyles[variant]}`}>{children}</Link>; }
export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>{label}</span><input {...props} className={`rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 ${props.className ?? ""}`} /></label>; }
export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) { return <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>{label}</span><select {...props} className={`rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 ${props.className ?? ""}`}>{children}</select></label>; }
export function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) { return <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>{label}</span><textarea {...props} className={`min-h-28 rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 ${props.className ?? ""}`} /></label>; }
export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "blue" | "amber" | "red" }) { const tones = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-700", blue: "bg-cyan-100 text-cyan-700", amber: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-700" }; return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>; }
export function Table({ children }: { children: React.ReactNode }) { return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-sm">{children}</table></div>; }
export function ActionButtons({ children }: { children: React.ReactNode }) { return <div className="flex flex-wrap items-center gap-2">{children}</div>; }
