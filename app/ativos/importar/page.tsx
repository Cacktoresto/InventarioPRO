import Link from "next/link";
import { Alert, Badge, Button, ButtonLink, Card, EmptyState, PageHeader, Table } from "@/components/ui";
import { duplicateValues, type AbsoluteNormalizedRow } from "@/lib/absolute-import";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { analyzeAbsoluteCsv, importAbsoluteBatch } from "./actions";

export const dynamic = "force-dynamic";

type ImportParams = { result?: string; message?: string; batchId?: string };

function normalized(value: unknown): AbsoluteNormalizedRow {
  const objectValue = typeof value === "object" && value !== null && !Array.isArray(value) ? value as Partial<Record<keyof AbsoluteNormalizedRow, unknown>> : {};
  const read = (key: keyof AbsoluteNormalizedRow) => typeof objectValue[key] === "string" && objectValue[key] ? String(objectValue[key]) : null;
  return {
    hostname: read("hostname"),
    serialNumber: read("serialNumber"),
    user: read("user"),
    email: read("email"),
    model: read("model"),
    manufacturer: read("manufacturer"),
    operatingSystem: read("operatingSystem"),
    lastSeen: read("lastSeen"),
    assetTag: read("assetTag"),
    deviceId: read("deviceId"),
  };
}

async function getPreview(batchId?: string) {
  if (!batchId) return null;
  const batch = await prisma.importBatch.findUnique({ where: { id: batchId }, include: { rows: { orderBy: { rowNumber: "asc" } } } });
  if (!batch) return null;
  const normalizedRows = batch.rows.map((row) => ({ ...row, normalized: normalized(row.normalizedData) }));
  const serials = normalizedRows.map((row) => row.normalized.serialNumber).filter((value): value is string => Boolean(value));
  const existingAssets = serials.length ? await prisma.asset.findMany({ where: { serialNumber: { in: serials } }, select: { serialNumber: true } }) : [];
  const existingSerials = new Set(existingAssets.map((asset) => asset.serialNumber).filter((value): value is string => Boolean(value)));
  const errorRows = normalizedRows.filter((row) => row.status === "FAILED" || row.errorMessage).length;
  return {
    batch,
    rows: normalizedRows,
    existing: normalizedRows.filter((row) => row.normalized.serialNumber && existingSerials.has(row.normalized.serialNumber)).length,
    newAssets: normalizedRows.filter((row) => row.normalized.serialNumber && !existingSerials.has(row.normalized.serialNumber)).length,
    errorRows,
    duplicateSerials: duplicateValues(normalizedRows.map((row) => row.normalized.serialNumber)),
    duplicateHosts: duplicateValues(normalizedRows.map((row) => row.normalized.hostname)),
  };
}

async function getHistory() {
  return prisma.importBatch.findMany({ where: { source: "ABSOLUTE" }, include: { uploadedByUser: true }, orderBy: { uploadedAt: "desc" }, take: 10 });
}

function statusTone(status: string): "slate" | "green" | "blue" | "amber" | "red" {
  if (status === "COMPLETED") return "green";
  if (status === "COMPLETED_WITH_ERRORS") return "amber";
  if (status === "FAILED" || status === "CANCELED") return "red";
  if (status === "PROCESSING") return "blue";
  return "slate";
}

export default async function ImportAbsolutePage({ searchParams }: { searchParams: Promise<ImportParams> }) {
  const params = await searchParams;
  const [preview, history] = await Promise.all([getPreview(params.batchId), getHistory()]);

  return (
    <>
      <PageHeader title="Importar CSV Absolute" description="Analise o relatório exportado do Absolute antes de criar ou atualizar ativos pelo serial." action={<ButtonLink href="/ativos" variant="secondary">Voltar para ativos</ButtonLink>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          {params.message ? <Alert status={params.result} message={params.message} /> : null}
          <form action={analyzeAbsoluteCsv} className="space-y-5">
            <div className="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 p-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Selecione o CSV exportado do Absolute
                <input name="csv" type="file" accept=".csv,text/csv" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal" required />
              </label>
              <p className="mt-2 text-xs text-slate-600">Limite de 5 MB. Colunas extras são ignoradas e colunas opcionais ausentes não impedem a análise.</p>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Colunas reconhecidas automaticamente</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">hostname, device name, computer name, serial, serial number, user, username, email, model, manufacturer, operating system, last seen, asset tag e device id.</p>
            </div>
            <Button>Analisar arquivo</Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Regras de importação</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li>Serial é a chave principal para identificar ativos existentes.</li>
            <li>Ativos existentes recebem dados técnicos do Absolute, preservando responsável, localização e status manuais.</li>
            <li>Novos ativos entram como notebook em estoque na localização CD, quando existente.</li>
            <li>Linhas sem serial são registradas com erro em vez de criar ativo.</li>
          </ul>
        </Card>
      </div>

      {preview ? <Card className="mt-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-bold text-slate-950">Preview do lote</h2><p className="text-sm text-slate-600">Arquivo: {preview.batch.fileName}</p></div>
          <form action={importAbsoluteBatch}><input type="hidden" name="batchId" value={preview.batch.id} /><Button>Confirmar importação</Button></form>
        </div>
        <div className="mb-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase text-slate-500">Total</p><p className="text-2xl font-bold">{preview.batch.totalRows}</p></div>
          <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs uppercase text-slate-500">Novos</p><p className="text-2xl font-bold">{preview.newAssets}</p></div>
          <div className="rounded-xl bg-cyan-50 p-4"><p className="text-xs uppercase text-slate-500">Atualizados</p><p className="text-2xl font-bold">{preview.existing}</p></div>
          <div className="rounded-xl bg-red-50 p-4"><p className="text-xs uppercase text-slate-500">Erros</p><p className="text-2xl font-bold">{preview.errorRows}</p></div>
          <div className="rounded-xl bg-amber-50 p-4"><p className="text-xs uppercase text-slate-500">Duplicidades</p><p className="text-2xl font-bold">{preview.duplicateSerials.length + preview.duplicateHosts.length}</p></div>
        </div>
        {(preview.duplicateSerials.length || preview.duplicateHosts.length) ? <Alert status="error" message={`Possíveis duplicidades no arquivo — serial: ${preview.duplicateSerials.join(", ") || "nenhuma"}; hostname: ${preview.duplicateHosts.join(", ") || "nenhuma"}.`} /> : null}
        <Table><thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="p-3">Linha</th><th>Serial</th><th>Hostname</th><th>Modelo</th><th>Usuário</th><th>Status</th><th>Erro</th></tr></thead><tbody>{preview.rows.slice(0, 25).map((row) => <tr key={row.id} className="border-t border-slate-200"><td className="p-3">{row.rowNumber}</td><td>{row.normalized.serialNumber ?? "—"}</td><td>{row.normalized.hostname ?? "—"}</td><td>{row.normalized.model ?? "—"}</td><td>{row.normalized.email ?? row.normalized.user ?? "—"}</td><td><Badge tone={statusTone(row.status)}>{row.status}</Badge></td><td>{row.errorMessage ?? "—"}</td></tr>)}</tbody></Table>
        {preview.rows.length > 25 ? <p className="mt-3 text-sm text-slate-500">Mostrando as primeiras 25 linhas do lote.</p> : null}
      </Card> : null}

      <Card className="mt-5">
        <h2 className="mb-4 text-xl font-bold text-slate-950">Histórico de importações</h2>
        {history.length ? <Table><thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="p-3">Data</th><th>Importador</th><th>Arquivo</th><th>Total</th><th>Sucesso</th><th>Erros</th><th>Status</th><th>Ações</th></tr></thead><tbody>{history.map((batch) => <tr key={batch.id} className="border-t border-slate-200"><td className="p-3">{formatDate(batch.uploadedAt)}</td><td>{batch.uploadedByUser?.name ?? "Sistema"}</td><td>{batch.fileName}</td><td>{batch.totalRows}</td><td>{batch.successRows}</td><td>{batch.errorRows}</td><td><Badge tone={statusTone(batch.status)}>{batch.status}</Badge></td><td><Link className="text-sm font-semibold text-cyan-700" href={`/ativos/importar?batchId=${batch.id}`}>Ver preview</Link></td></tr>)}</tbody></Table> : <EmptyState text="Nenhuma importação do Absolute registrada." />}
      </Card>
    </>
  );
}
