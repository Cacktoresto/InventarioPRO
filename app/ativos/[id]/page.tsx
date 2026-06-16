import { notFound } from "next/navigation";
import { Card, PageTitle } from "@/components/ui";
import { assetStatusLabels, assetTypeLabels, formatDate, movementTypeLabels, termStatusLabels, termTypeLabels } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const assetDetailsInclude = {
  currentLocation: true,
  currentResponsible: true,
  movements: {
    include: { fromLocation: true, toLocation: true },
    orderBy: { requestedAt: "desc" },
  },
  responsibilityTerms: {
    include: { responsible: true },
    orderBy: { generatedAt: "desc" },
  },
} as const;

async function getAssetDetails(id: string) {
  return prisma.asset.findUnique({ where: { id }, include: assetDetailsInclude });
}

type AssetDetailsRecord = NonNullable<Awaited<ReturnType<typeof getAssetDetails>>>;
type AssetMovementRecord = AssetDetailsRecord["movements"][number];
type AssetTermRecord = AssetDetailsRecord["responsibilityTerms"][number];

export default async function AssetDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetDetails(id);

  if (!asset) notFound();

  return (
    <>
      <PageTitle title={`Ativo ${asset.assetTag}`} description="Dados cadastrais, vínculo atual e histórico." />
      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Dados do ativo</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Tipo" value={assetTypeLabels[asset.type]} />
            <Row label="Status" value={assetStatusLabels[asset.status]} />
            <Row label="Serial" value={asset.serialNumber} />
            <Row label="Hostname" value={asset.hostname} />
            <Row label="Marca/modelo" value={[asset.brand, asset.model].filter(Boolean).join(" ")} />
            <Row label="Origem" value={asset.origin} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Responsável atual</h2>
          <p className="font-semibold">{asset.currentResponsible?.name ?? "Sem responsável"}</p>
          <p className="text-sm text-slate-500">{asset.currentResponsible?.email ?? "Ativo sem pessoa vinculada"}</p>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Localização atual</h2>
          <p className="font-semibold">{asset.currentLocation.name}</p>
          <p className="text-sm text-slate-500">{asset.currentLocation.code}</p>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Histórico de movimentações</h2>
          {asset.movements.length ? (
            <div className="space-y-3">
              {asset.movements.map((movement: AssetMovementRecord) => (
                <div key={movement.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <p className="font-semibold">
                    {movementTypeLabels[movement.type]} • {formatDate(movement.executedAt ?? movement.requestedAt)}
                  </p>
                  <p className="text-slate-600">{movement.fromLocation?.name ?? "—"} → {movement.toLocation?.name ?? "—"}</p>
                  <p className="text-slate-500">{movement.reason ?? "Sem motivo informado"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma movimentação encontrada.</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Histórico de termos</h2>
          {asset.responsibilityTerms.length ? (
            <div className="space-y-3">
              {asset.responsibilityTerms.map((term: AssetTermRecord) => (
                <div key={term.id} className="rounded-xl border border-slate-200 p-4 text-sm">
                  <p className="font-semibold">{term.termNumber} • {termTypeLabels[term.type]}</p>
                  <p className="text-slate-600">{term.responsible.name} — {termStatusLabels[term.status]}</p>
                  <p className="text-slate-500">Gerado em {formatDate(term.generatedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhum termo encontrado.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value || "—"}</dd>
    </div>
  );
}
