import Link from "next/link";
import { Card, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { createAsset } from "../actions";
import { AssetForm } from "../form";

export const dynamic = "force-dynamic";

type AssetNewSearchParams = { result?: string; message?: string };

export default async function NewAssetPage({ searchParams }: { searchParams: Promise<AssetNewSearchParams> }) {
  const [params, locations, people] = await Promise.all([
    searchParams,
    prisma.location.findMany({ where: { active: true }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.person.findMany({ where: { active: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  return <><PageTitle title="Novo Ativo" description="Cadastre um ativo real no banco." action={<Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href="/ativos">Voltar</Link>} /><Card>{params.message ? <Alert status={params.result} message={params.message} /> : null}<AssetForm action={createAsset} locations={locations} people={people} submitLabel="Criar ativo" /></Card></>;
}

function Alert({ status, message }: { status?: string; message: string }) {
  const isError = status === "error";
  return <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p>;
}
