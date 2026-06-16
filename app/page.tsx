import { prisma } from "@/lib/prisma";
import { Card, PageTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

type DashboardCard = {
  label: string;
  value: number;
};

export default async function Dashboard() {
  const [totalAssets, totalPeople, totalLocations, inStock, inUse, maintenance] = await Promise.all([
    prisma.asset.count({ where: { deletedAt: null } }),
    prisma.person.count(),
    prisma.location.count(),
    prisma.asset.count({ where: { status: "AVAILABLE", deletedAt: null } }),
    prisma.asset.count({ where: { status: "ASSIGNED", deletedAt: null } }),
    prisma.asset.count({ where: { status: "IN_MAINTENANCE", deletedAt: null } }),
  ]);
  const cards: DashboardCard[] = [{ label: "Total de ativos", value: totalAssets }, { label: "Total de pessoas", value: totalPeople }, { label: "Total de localizações", value: totalLocations }, { label: "Ativos em estoque", value: inStock }, { label: "Ativos em uso", value: inUse }, { label: "Ativos em manutenção", value: maintenance }];
  return <><PageTitle title="Dashboard" description="Indicadores consolidados em tempo real via Prisma." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map((card: DashboardCard) => <Card key={card.label}><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-3 text-4xl font-bold text-slate-950">{card.value}</p></Card>)}</div></>;
}
