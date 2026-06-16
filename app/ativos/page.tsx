import Link from "next/link";
import { ActionButtons, Alert, Badge, ButtonLink, Card, EmptyState, PageHeader, Table } from "@/components/ui";
import { assetStatuses, assetStatusLabel, assetStatusLabels, assetTypeLabel, statusBadgeTone, type AssetStatusValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type AssetSearchParams = {
  q?: string;
  status?: AssetStatusValue;
  page?: string;
  result?: string;
  message?: string;
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
      <PageHeader title="Ativos" description="Consulta operacional dos bens cadastrados." action={<><ButtonLink href="/ativos/importar" variant="secondary">Importar CSV Absolute</ButtonLink><ButtonLink href="/ativos/novo">Novo Ativo</ButtonLink></>} />
      <Card>
        {params.message ? <Alert status={params.result} message={params.message} /> : null}
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
        {assets.length ? <Table>
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <tr><th className="p-3">Etiqueta</th><th>Tipo</th><th>Marca/modelo</th><th>Status</th><th>Responsável</th><th>Localização</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {assets.map((asset: AssetListRecord) => (
                <tr key={asset.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-3 font-semibold"><Link className="text-cyan-700 hover:underline" href={`/ativos/${asset.id}`}>{asset.assetTag}</Link></td>
                  <td>{assetTypeLabel(asset.type)}</td>
                  <td>{brandModel(asset)}</td>
                  <td><Badge tone={statusBadgeTone(asset.status)}>{assetStatusLabel(asset.status)}</Badge></td>
                  <td>{asset.currentResponsible?.name ?? "—"}</td>
                  <td>{asset.currentLocation.name}</td>
                  <td><ActionButtons><Link className="text-sm font-semibold text-cyan-700" href={`/ativos/${asset.id}`}>Ver</Link><Link className="text-sm font-semibold text-cyan-700" href={`/ativos/${asset.id}/editar`}>Editar</Link></ActionButtons></td>
                </tr>
              ))}
            </tbody>
          </Table> : <EmptyState text="Nenhum ativo encontrado para os filtros informados." />}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600"><span>{total} registro(s)</span><span>Página {page} de {pages}</span></div>
      </Card>
    </>
  );
}
