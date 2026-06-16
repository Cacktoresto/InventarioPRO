"use server";

import type { ImportStatus, Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { absoluteSpecifications, initialAssetStatus, initialImportStatus, MAX_ABSOLUTE_CSV_BYTES, parseAbsoluteCsv, type AbsoluteNormalizedRow } from "@/lib/absolute-import";
import { buildListUrl, prismaErrorMessage, requiredText } from "@/lib/crud";
import { prisma } from "@/lib/prisma";

function importUrl(status: "success" | "error", message: string, batchId?: string) {
  const params = new URLSearchParams({ result: status, message });
  if (batchId) params.set("batchId", batchId);
  return `/ativos/importar?${params.toString()}`;
}

function jsonObject(value: Record<string, string> | AbsoluteNormalizedRow): Prisma.InputJsonObject {
  return Object.entries(value).reduce<Prisma.InputJsonObject>((acc, [key, item]) => ({ ...acc, [key]: item }), {});
}

export async function analyzeAbsoluteCsv(formData: FormData): Promise<void> {
  const fileValue = formData.get("csv");
  if (!(fileValue instanceof File) || fileValue.size === 0) redirect(importUrl("error", "Selecione um arquivo CSV do Absolute."));
  if (!fileValue.name.toLowerCase().endsWith(".csv")) redirect(importUrl("error", "Envie um arquivo com extensão .csv."));
  if (fileValue.size > MAX_ABSOLUTE_CSV_BYTES) redirect(importUrl("error", "O arquivo excede o limite de 5 MB."));

  let batchId: string;
  try {
    const text = await fileValue.text();
    const parsed = parseAbsoluteCsv(text);
    const errorRows = parsed.rows.filter((row) => row.errorMessage).length;
    const batch = await prisma.importBatch.create({
      data: {
        source: "ABSOLUTE",
        fileName: fileValue.name,
        fileHash: parsed.fileHash,
        totalRows: parsed.rows.length,
        errorRows,
        status: initialImportStatus(errorRows, parsed.rows.length),
        rows: {
          create: parsed.rows.map((row) => ({
            rowNumber: row.rowNumber,
            rawData: jsonObject(row.rawData),
            normalizedData: jsonObject(row.normalizedData),
            status: row.errorMessage ? "FAILED" : "PENDING",
            errorMessage: row.errorMessage,
          })),
        },
      },
    });
    batchId = batch.id;
  } catch (error) {
    redirect(importUrl("error", prismaErrorMessage(error, "Não foi possível analisar o CSV.")));
  }
  redirect(importUrl("success", "Arquivo analisado. Revise o preview antes de importar.", batchId));
}

function normalizedFromJson(value: Prisma.JsonValue): AbsoluteNormalizedRow {
  const objectValue = typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
  const read = (key: keyof AbsoluteNormalizedRow): string | null => {
    const item = (objectValue as Partial<Record<keyof AbsoluteNormalizedRow, Prisma.JsonValue>>)[key];
    return typeof item === "string" && item.trim() ? item.trim() : null;
  };
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

function assetTagFor(row: AbsoluteNormalizedRow) {
  return row.assetTag ?? `ABS-${row.serialNumber ?? randomUUID()}`.slice(0, 60);
}

export async function importAbsoluteBatch(formData: FormData): Promise<void> {
  const batchId = requiredText(formData, "batchId", "Lote");

  const cd = await prisma.location.findFirst({ where: { code: { equals: "CD", mode: "insensitive" }, active: true }, select: { id: true } });
  const fallback = cd ?? await prisma.location.findFirst({ where: { active: true }, select: { id: true }, orderBy: { createdAt: "asc" } });
  if (!fallback) redirect(importUrl("error", "Cadastre uma localização ativa antes de importar ativos.", batchId));

  let result: { created: number; updated: number; errors: number };
  try {
    result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rows = await tx.importRow.findMany({ where: { importBatchId: batchId }, orderBy: { rowNumber: "asc" } });
      let created = 0;
      let updated = 0;
      let errors = rows.filter((row) => row.status === "FAILED").length;

      for (const row of rows.filter((item) => item.status === "PENDING")) {
        const normalized = normalizedFromJson(row.normalizedData);
        if (!normalized.serialNumber) {
          errors += 1;
          await tx.importRow.update({ where: { id: row.id }, data: { status: "FAILED", errorMessage: "Linha sem serial; ativo não será criado." } });
          continue;
        }

        try {
          const existing = await tx.asset.findUnique({ where: { serialNumber: normalized.serialNumber } });
          if (existing) {
            const asset = await tx.asset.update({
              where: { id: existing.id },
              data: {
                hostname: normalized.hostname ?? existing.hostname,
                brand: normalized.manufacturer ?? existing.brand,
                model: normalized.model ?? existing.model,
                specifications: absoluteSpecifications(normalized),
                absoluteDeviceId: normalized.deviceId ?? existing.absoluteDeviceId,
                origin: "ABSOLUTE_IMPORT",
              },
            });
            updated += 1;
            await tx.importRow.update({ where: { id: row.id }, data: { status: "COMPLETED", assetId: asset.id, errorMessage: null } });
            await tx.auditEvent.create({ data: { entityType: "Asset", entityId: asset.id, eventType: "ABSOLUTE_IMPORT_UPDATE", afterPayload: absoluteSpecifications(normalized), metadata: { importBatchId: batchId, rowNumber: row.rowNumber } } });
          } else {
            const asset = await tx.asset.create({
              data: {
                assetTag: assetTagFor(normalized),
                serialNumber: normalized.serialNumber,
                hostname: normalized.hostname,
                type: "NOTEBOOK",
                status: initialAssetStatus(),
                currentLocationId: fallback.id,
                brand: normalized.manufacturer,
                model: normalized.model,
                specifications: absoluteSpecifications(normalized),
                absoluteDeviceId: normalized.deviceId,
                origin: "ABSOLUTE_IMPORT",
              },
            });
            created += 1;
            await tx.importRow.update({ where: { id: row.id }, data: { status: "COMPLETED", assetId: asset.id, errorMessage: null } });
            await tx.auditEvent.create({ data: { entityType: "Asset", entityId: asset.id, eventType: "ABSOLUTE_IMPORT_CREATE", afterPayload: absoluteSpecifications(normalized), metadata: { importBatchId: batchId, rowNumber: row.rowNumber } } });
          }
        } catch (error) {
          errors += 1;
          await tx.importRow.update({ where: { id: row.id }, data: { status: "FAILED", errorMessage: prismaErrorMessage(error, "Erro ao importar esta linha.") } });
        }
      }

      const status: ImportStatus = errors > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
      await tx.importBatch.update({ where: { id: batchId }, data: { status, processedAt: new Date(), successRows: created + updated, errorRows: errors } });
      return { created, updated, errors };
    });

  } catch (error) {
    redirect(importUrl("error", prismaErrorMessage(error, "Não foi possível importar o lote."), batchId));
  }
  redirect(buildListUrl("/ativos", "success", `Importação concluída: ${result.created} criado(s), ${result.updated} atualizado(s), ${result.errors} erro(s).`));
}
