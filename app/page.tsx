import { Badge, Card, EmptyState, PageHeader, Table } from "@/components/ui";
import { assetStatusLabel, assetTypeLabel, formatDate, movementTypeLabel, statusBadgeTone } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type IndicatorCard = { icon: string; title: string; value: number; helper: string; tone: string };
type DistributionItem = { label: string; value: number; tone: string };

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function movementIcon(type: string) {
  const icons: Record<string, string> = {
    HANDOVER: "↗",
    RETURN: "↙",
    TRANSFER: "⇄",
    MAINTENANCE_SEND: "⚒",
    MAINTENANCE_RETURN: "✓",
    DISPOSAL_SEND: "✕",
    INVENTORY_ADJUSTMENT: "+",
  };
  return icons[type] ?? "•";
}

function eventLabel(eventType: string) {
  return eventType
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DistributionCard({ title, description, items, total }: { title: string; description: string; items: DistributionItem[]; total: number }) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-semibold text-slate-950">{item.value}</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100">
                <div className={`h-2.5 rounded-full ${item.tone}`} style={{ width: `${percent(item.value, total)}%` }} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="Sem dados para exibir neste painel." />
        )}
      </div>
    </Card>
  );
}

export default async function Dashboard() {
  const [totalAssets, inUse, inStock, maintenance, disposed, latestMovements, recentAssets, assetsByLocation, assetsByStatus, auditEvents] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.asset.count({ where: { status: "ASSIGNED", deletedAt: null } }),
    prisma.asset.count({ where: { status: "AVAILABLE", deletedAt: null } }),
    prisma.asset.count({ where: { status: "IN_MAINTENANCE", deletedAt: null } }),
    prisma.asset.count({ where: { status: "DISPOSED", deletedAt: null } }),
    prisma.assetMovement.findMany({ include: { asset: true, fromLocation: true, toLocation: true }, orderBy: [{ executedAt: "desc" }, { requestedAt: "desc" }], take: 6 }),
    prisma.asset.findMany({ include: { currentLocation: true }, where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.location.findMany({ select: { name: true, _count: { select: { assets: { where: { deletedAt: null } } } } }, orderBy: { name: "asc" } }),
    prisma.asset.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.auditEvent.findMany({ include: { actorUser: true }, orderBy: { occurredAt: "desc" }, take: 8 }),
  ]);

  const cards: IndicatorCard[] = [
    { icon: "▣", title: "Total de Ativos", value: totalAssets, helper: "Patrimônio controlado", tone: "from-slate-900 to-slate-700" },
    { icon: "✓", title: "Em Uso", value: inUse, helper: "Ativos alocados", tone: "from-emerald-600 to-emerald-500" },
    { icon: "□", title: "Em Estoque", value: inStock, helper: "Disponíveis para entrega", tone: "from-cyan-600 to-cyan-500" },
    { icon: "⚒", title: "Em Manutenção", value: maintenance, helper: "Aguardando retorno", tone: "from-amber-500 to-orange-500" },
    { icon: "✕", title: "Descartados", value: disposed, helper: "Baixados do patrimônio", tone: "from-red-600 to-red-500" },
  ];

  const locationItems = assetsByLocation
    .map((location) => ({ label: location.name, value: location._count.assets, tone: "bg-cyan-500" }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const statusCount = new Map(assetsByStatus.map((item) => [item.status, item._count._all]));
  const statusItems: DistributionItem[] = [
    { label: "Em Uso", value: statusCount.get("ASSIGNED") ?? 0, tone: "bg-emerald-500" },
    { label: "Estoque", value: statusCount.get("AVAILABLE") ?? 0, tone: "bg-cyan-500" },
    { label: "Manutenção", value: statusCount.get("IN_MAINTENANCE") ?? 0, tone: "bg-amber-500" },
    { label: "Descartado", value: statusCount.get("DISPOSED") ?? 0, tone: "bg-red-500" },
  ];

  return (
    <>
      <PageHeader title="Dashboard Executivo" description="Visão executiva do ambiente, operação patrimonial e rastreabilidade recente." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title} className="min-h-40 overflow-hidden p-0">
            <div className={`h-1.5 bg-gradient-to-r ${card.tone}`} />
            <div className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-semibold text-slate-500">{card.title}</p><p className="mt-3 text-4xl font-bold text-slate-950">{card.value}</p></div>
                <span className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-700">{card.icon}</span>
              </div>
              <p className="mt-auto pt-4 text-sm text-slate-500">{card.helper}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card><h2 className="text-lg font-semibold">Últimas Movimentações</h2><p className="mb-4 text-sm text-slate-500">Mais recentes primeiro, com origem, destino e status atual.</p>{latestMovements.length ? <Table><thead className="text-xs uppercase tracking-wide text-slate-600"><tr><th>Ativo</th><th>Tipo</th><th>Origem</th><th>Destino</th><th>Data</th><th>Status</th></tr></thead><tbody>{latestMovements.map((movement) => <tr key={movement.id}><td className="font-semibold text-slate-900">{movement.asset.assetTag}</td><td><span className="mr-2 text-cyan-700">{movementIcon(movement.type)}</span>{movementTypeLabel(movement.type)}</td><td>{movement.fromLocation?.name ?? "—"}</td><td>{movement.toLocation?.name ?? movement.conditionNotes ?? "—"}</td><td>{formatDate(movement.executedAt ?? movement.requestedAt)}</td><td><Badge tone={statusBadgeTone(movement.asset.status)}>{assetStatusLabel(movement.asset.status)}</Badge></td></tr>)}</tbody></Table> : <EmptyState text="Movimentações aparecerão aqui assim que forem registradas." />}</Card>
        <Card><h2 className="text-lg font-semibold">Ativos Recentes</h2><p className="mb-4 text-sm text-slate-500">Últimos bens cadastrados no patrimônio.</p>{recentAssets.length ? <div className="space-y-3">{recentAssets.map((asset) => <div key={asset.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div><p className="font-semibold text-slate-950">{asset.assetTag}</p><p className="text-sm text-slate-500">{assetTypeLabel(asset.type)} • {asset.currentLocation.name}</p></div><Badge tone={statusBadgeTone(asset.status)}>{assetStatusLabel(asset.status)}</Badge></div>)}</div> : <EmptyState text="Nenhum ativo cadastrado até o momento." />}</Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <DistributionCard title="Distribuição por Localização" description="Quantidade de ativos por unidade operacional." items={locationItems} total={totalAssets} />
        <DistributionCard title="Distribuição por Status" description="Leitura rápida da situação do parque." items={statusItems} total={totalAssets} />
      </div>

      <Card className="mt-6"><h2 className="text-lg font-semibold">Eventos Recentes de Auditoria</h2><p className="mb-4 text-sm text-slate-500">Últimos eventos registrados para rastreabilidade operacional.</p>{auditEvents.length ? <Table><thead className="text-xs uppercase tracking-wide text-slate-600"><tr><th>Data</th><th>Usuário</th><th>Evento</th><th>Entidade</th></tr></thead><tbody>{auditEvents.map((event) => <tr key={event.id}><td>{formatDate(event.occurredAt)}</td><td>{event.actorUser?.name ?? "Sistema"}</td><td className="font-semibold text-slate-900">{eventLabel(event.eventType)}</td><td>{event.entityType}</td></tr>)}</tbody></Table> : <EmptyState text="Os eventos de auditoria serão exibidos neste painel quando existirem registros." />}</Card>
    </>
  );
}
