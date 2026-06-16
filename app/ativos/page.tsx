import Link from "next/link";
import { Button, Card, PageTitle } from "@/components/ui";
import { assetStatuses, assetStatusLabel, assetStatusLabels, assetTypeLabel, type AssetStatusValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

type AssetSearchParams = {
  q?: string;
  status?: AssetStatusValue;
  page?: string;
};

async function getAssets(params: AssetSearchParams) {
  const page = Math.max(Number(params.page ?? 1), 1);
  const where = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.q
      ? {
          OR: [
            { assetTag: { contains: params.q, mode: "insensitive" as const } },
            { serialNumber: { contains: params.q, mode: "insensitive" as const } },
            { hostname: { contains: params.q, mode: "insensitive" as const } },
            { brand: { contains: params.q, mode: "insensitive" as const } },
            { model: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { currentLocation: true, currentResponsible: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.asset.count({ where }),
  ]);

  return { assets, page, pages: Math.max(Math.ceil(total / PAGE_SIZE), 1), total };
}

type AssetListRecord = Awaited<ReturnType<typeof getAssets>>["assets"][number];

function brandModel(asset: AssetListRecord) {
  return [asset.brand, asset.model].filter((value: string | null): value is string => Boolean(value)).join(" ") || "—";
}

export default async function AssetsPage({ searchParams }: { searchParams: Promise<AssetSearchParams> }) {
  const params = await searchParams;
  const { assets, page, pages, total } = await getAssets(params);

  return (
    <>
      <PageTitle title="Ativos" description="Consulta operacional dos bens cadastrados." action={<Button>Novo Ativo</Button>} />
      <Card>
        <form className="mb-5 flex flex-wrap gap-3">
          <input name="q" defaultValue={params.q} placeholder="Buscar por etiqueta, serial, host..." className="min-w-80 rounded-xl border border-slate-300 px-4 py-2" />
          <select name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-slate-300 px-4 py-2">
            <option value="">Todos os status</option>
            {assetStatuses.map((status: AssetStatusValue) => (
              <option key={status} value={status}>{assetStatusLabels[status]}</option>
            ))}
          </select>
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-white">Filtrar</button>
        </form>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr><th className="p-3">Etiqueta</th><th>Tipo</th><th>Marca/modelo</th><th>Status</th><th>Responsável</th><th>Localização</th></tr>
            </thead>
            <tbody>
              {assets.map((asset: AssetListRecord) => (
                <tr key={asset.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-3 font-semibold"><Link className="text-cyan-700 hover:underline" href={`/ativos/${asset.id}`}>{asset.assetTag}</Link></td>
                  <td>{assetTypeLabel(asset.type)}</td>
                  <td>{brandModel(asset)}</td>
                  <td>{assetStatusLabel(asset.status)}</td>
                  <td>{asset.currentResponsible?.name ?? "—"}</td>
                  <td>{asset.currentLocation.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600"><span>{total} registro(s)</span><span>Página {page} de {pages}</span></div>
      </Card>
    </>
  );
}
