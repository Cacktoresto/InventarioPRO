import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { updateAsset } from "../../actions";
import { AssetForm } from "../../form";

export const dynamic = "force-dynamic";

type EditParams = { id: string };
type EditSearchParams = { result?: string; message?: string };

export default async function EditAssetPage({ params, searchParams }: { params: Promise<EditParams>; searchParams: Promise<EditSearchParams> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [asset, locations, people] = await Promise.all([
    prisma.asset.findUnique({ where: { id } }),
    prisma.location.findMany({ where: { active: true }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.person.findMany({ where: { active: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  if (!asset) notFound();

  return <><PageTitle title={`Editar ${asset.assetTag}`} description="Atualize os dados cadastrais do ativo." action={<Link className="rounded-xl border px-4 py-2 text-sm font-semibold" href={`/ativos/${asset.id}`}>Cancelar</Link>} /><Card>{query.message ? <Alert status={query.result} message={query.message} /> : null}<AssetForm action={updateAsset} asset={asset} locations={locations} people={people} submitLabel="Salvar alterações" /></Card></>;
}

function Alert({ status, message }: { status?: string; message: string }) {
  const isError = status === "error";
  return <p className={`mb-4 rounded-xl border px-4 py-3 text-sm ${isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p>;
}
