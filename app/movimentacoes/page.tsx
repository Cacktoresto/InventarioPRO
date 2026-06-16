import { Alert, Badge, ButtonLink, Card, EmptyState, PageHeader, Table } from "@/components/ui";
import { assetStatusLabel, formatDate, movementTypeLabel, statusBadgeTone } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { result?: string; message?: string };

type MovementRecord = Awaited<ReturnType<typeof getMovements>>[number];

async function getMovements() {
  return prisma.assetMovement.findMany({ include: { asset: true, fromLocation: true, toLocation: true }, orderBy: [{ executedAt: "desc" }, { requestedAt: "desc" }], take: 100 });
}

export default async function MovementsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const [params, movements] = await Promise.all([searchParams, getMovements()]);
  const responsibleIds = movements.map((movement: MovementRecord) => movement.toResponsibleId).filter((id: string | null): id is string => Boolean(id));
  const people = responsibleIds.length ? await prisma.person.findMany({ where: { id: { in: responsibleIds } }, select: { id: true, name: true } }) : [];
  const peopleById = new Map(people.map((person: { id: string; name: string }) => [person.id, person.name]));
  return <><PageHeader title="Movimentações" description="Histórico real de movimentações gravadas no Prisma e refletidas no status dos ativos." action={<ButtonLink href="/movimentacoes/nova">Nova Movimentação</ButtonLink>} /><Card>{params.message ? <Alert status={params.result} message={params.message} /> : null}{movements.length ? <Table><thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="p-3">Ativo</th><th className="p-3">Status</th><th className="p-3">Tipo</th><th className="p-3">Origem</th><th className="p-3">Destino</th><th className="p-3">Responsável</th><th className="p-3">Data</th><th className="p-3">Observação</th></tr></thead><tbody>{movements.map((movement: MovementRecord) => <tr key={movement.id} className="border-t border-slate-200 hover:bg-slate-50"><td className="p-3 font-semibold text-slate-900">{movement.asset.assetTag}</td><td className="p-3"><Badge tone={statusBadgeTone(movement.asset.status)}>{assetStatusLabel(movement.asset.status)}</Badge></td><td className="p-3">{movementTypeLabel(movement.type)}</td><td className="p-3">{movement.fromLocation?.name ?? "—"}</td><td className="p-3">{movement.toLocation?.name ?? movement.conditionNotes ?? "—"}</td><td className="p-3">{movement.toResponsibleId ? peopleById.get(movement.toResponsibleId) ?? movement.toResponsibleId : "—"}</td><td className="p-3">{formatDate(movement.executedAt ?? movement.requestedAt)}</td><td className="p-3 text-slate-600">{movement.reason ?? "—"}</td></tr>)}</tbody></Table> : <EmptyState text="Crie a primeira movimentação para iniciar o histórico operacional." />}</Card></>;
}
