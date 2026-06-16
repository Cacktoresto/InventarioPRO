import { Alert, ButtonLink, Card, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { movementFormTypeLabels, movementFormTypes, type MovementFormType } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createMovement } from "../actions";

export const dynamic = "force-dynamic";

type Params = { result?: string; message?: string };

export default async function NewMovementPage({ searchParams }: { searchParams: Promise<Params> }) {
  const [params, assets, locations, people] = await Promise.all([
    searchParams,
    prisma.asset.findMany({ where: { deletedAt: null }, select: { id: true, assetTag: true, serialNumber: true, currentLocation: { select: { name: true } } }, orderBy: { assetTag: "asc" } }),
    prisma.location.findMany({ where: { active: true }, select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    prisma.person.findMany({ where: { active: true }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  return <><PageHeader title="Nova Movimentação" description="Registre entradas, entregas, transferências, manutenções, devoluções e descartes." action={<ButtonLink href="/movimentacoes" variant="secondary">Voltar</ButtonLink>} /><Card>{params.message ? <Alert status={params.result} message={params.message} /> : null}<form action={createMovement} className="grid gap-4 md:grid-cols-2"><Select name="assetId" label="Ativo" required><option value="">Selecione</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.assetTag} — {asset.serialNumber ?? "sem serial"} ({asset.currentLocation.name})</option>)}</Select><Select name="type" label="Tipo de movimentação" required><option value="">Selecione</option>{movementFormTypes.map((type: MovementFormType) => <option key={type} value={type}>{movementFormTypeLabels[type]}</option>)}</Select><Select name="fromLocationId" label="Origem"><option value="">Usar localização atual</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} ({location.code})</option>)}</Select><Input name="destination" label="Destino textual" placeholder="Ex.: estoque central, assistência, descarte" /><Select name="toResponsibleId" label="Responsável/Pessoa"><option value="">Sem responsável</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.email ? ` — ${person.email}` : ""}</option>)}</Select><Select name="toLocationId" label="Localização destino"><option value="">Sem alteração</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.name} ({location.code})</option>)}</Select><Input name="occurredAt" label="Data da movimentação" type="datetime-local" /><div className="md:col-span-2"><Textarea name="reason" label="Observação" placeholder="Descreva o motivo, condição ou contexto da movimentação" /></div><div className="md:col-span-2"><button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Criar movimentação</button></div></form></Card></>;
}
