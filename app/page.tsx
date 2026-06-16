import { Badge, Card, PageHeader, Table } from "@/components/ui";
import { assetStatusLabel, formatDate, movementTypeLabel, statusBadgeTone } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DashboardCard = { label: string; value: number; tone: string };

export default async function Dashboard() {
  const [totalAssets, inUse, inStock, maintenance, disposed, latestMovements] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { status: "ASSIGNED", deletedAt: null } }),
    prisma.asset.count({ where: { status: "AVAILABLE", deletedAt: null } }),
    prisma.asset.count({ where: { status: "IN_MAINTENANCE", deletedAt: null } }),
    prisma.asset.count({ where: { status: "DISPOSED", deletedAt: null } }),
    prisma.assetMovement.findMany({ include: { asset: true, fromLocation: true, toLocation: true }, orderBy: [{ executedAt: "desc" }, { requestedAt: "desc" }], take: 6 }),
  ]);
  const cards: DashboardCard[] = [{ label: "Total de ativos", value: totalAssets, tone: "border-cyan-200" }, { label: "Em uso", value: inUse, tone: "border-blue-200" }, { label: "Em estoque", value: inStock, tone: "border-emerald-200" }, { label: "Manutenção", value: maintenance, tone: "border-amber-200" }, { label: "Descartados", value: disposed, tone: "border-red-200" }];
  return <><PageHeader title="Dashboard" description="Indicadores consolidados em tempo real via Prisma." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <Card key={card.label} className={`border-t-4 ${card.tone}`}><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-3 text-4xl font-bold text-slate-950">{card.value}</p></Card>)}</div><Card className="mt-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Últimas movimentações</h2><p className="text-sm text-slate-500">Eventos operacionais recentes.</p></div></div><Table><thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="p-3">Ativo</th><th className="p-3">Status atual</th><th className="p-3">Tipo</th><th className="p-3">Origem</th><th className="p-3">Destino</th><th className="p-3">Data</th></tr></thead><tbody>{latestMovements.map((movement) => <tr key={movement.id} className="border-t border-slate-200"><td className="p-3 font-semibold">{movement.asset.assetTag}</td><td className="p-3"><Badge tone={statusBadgeTone(movement.asset.status)}>{assetStatusLabel(movement.asset.status)}</Badge></td><td className="p-3">{movementTypeLabel(movement.type)}</td><td className="p-3">{movement.fromLocation?.name ?? "—"}</td><td className="p-3">{movement.toLocation?.name ?? "—"}</td><td className="p-3">{formatDate(movement.executedAt ?? movement.requestedAt)}</td></tr>)}</tbody></Table></Card></>;
}
