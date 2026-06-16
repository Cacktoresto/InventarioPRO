import type { AssetStatus, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";

export const MAX_ABSOLUTE_CSV_BYTES = 5 * 1024 * 1024;

const columnAliases = {
  hostname: ["hostname", "device name", "computer name"],
  serialNumber: ["serial", "serial number"],
  user: ["user", "username"],
  email: ["email"],
  model: ["model"],
  manufacturer: ["manufacturer"],
  operatingSystem: ["operating system"],
  lastSeen: ["last seen"],
  assetTag: ["asset tag"],
  deviceId: ["device id"],
} as const;

export type AbsoluteNormalizedRow = {
  hostname: string | null;
  serialNumber: string | null;
  user: string | null;
  email: string | null;
  model: string | null;
  manufacturer: string | null;
  operatingSystem: string | null;
  lastSeen: string | null;
  assetTag: string | null;
  deviceId: string | null;
};

export type AbsoluteParsedRow = {
  rowNumber: number;
  rawData: Record<string, string>;
  normalizedData: AbsoluteNormalizedRow;
  errorMessage: string | null;
};

export type AbsoluteCsvParseResult = {
  headers: string[];
  rows: AbsoluteParsedRow[];
  fileHash: string;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function clean(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function splitCsv(text: string) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += char + next;
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
      current += char;
    } else if (char === "\n" && !quoted) {
      if (current.trim()) lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

function detectedDelimiter(headerLine: string) {
  const commaCount = parseCsvLine(headerLine, ",").length;
  const semicolonCount = parseCsvLine(headerLine, ";").length;
  return semicolonCount > commaCount ? ";" : ",";
}

function findValue(raw: Record<string, string>, normalizedHeaderMap: Map<string, string>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const originalHeader = normalizedHeaderMap.get(alias);
    if (originalHeader) return clean(raw[originalHeader]);
  }
  return null;
}

export function parseAbsoluteCsv(text: string): AbsoluteCsvParseResult {
  const fileHash = createHash("sha256").update(text).digest("hex");
  const lines = splitCsv(text);
  if (lines.length === 0) throw new Error("O CSV está vazio.");

  const delimiter = detectedDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((header) => header.trim()).filter(Boolean);
  if (headers.length === 0) throw new Error("Não foi possível ler os cabeçalhos do CSV.");

  const normalizedHeaderMap = new Map(headers.map((header) => [normalizeHeader(header), header]));
  const rows = lines.slice(1).map((line, index): AbsoluteParsedRow => {
    const cells = parseCsvLine(line, delimiter);
    const rawData = headers.reduce<Record<string, string>>((acc, header, headerIndex) => ({ ...acc, [header]: cells[headerIndex]?.trim() ?? "" }), {});
    const normalizedData: AbsoluteNormalizedRow = {
      hostname: findValue(rawData, normalizedHeaderMap, columnAliases.hostname),
      serialNumber: findValue(rawData, normalizedHeaderMap, columnAliases.serialNumber),
      user: findValue(rawData, normalizedHeaderMap, columnAliases.user),
      email: findValue(rawData, normalizedHeaderMap, columnAliases.email),
      model: findValue(rawData, normalizedHeaderMap, columnAliases.model),
      manufacturer: findValue(rawData, normalizedHeaderMap, columnAliases.manufacturer),
      operatingSystem: findValue(rawData, normalizedHeaderMap, columnAliases.operatingSystem),
      lastSeen: findValue(rawData, normalizedHeaderMap, columnAliases.lastSeen),
      assetTag: findValue(rawData, normalizedHeaderMap, columnAliases.assetTag),
      deviceId: findValue(rawData, normalizedHeaderMap, columnAliases.deviceId),
    };
    return { rowNumber: index + 2, rawData, normalizedData, errorMessage: normalizedData.serialNumber ? null : "Linha sem serial; ativo não será criado." };
  });

  return { headers, rows, fileHash };
}

export function duplicateValues(values: Array<string | null>) {
  const counts = new Map<string, number>();
  values.filter((value): value is string => Boolean(value)).forEach((value) => counts.set(value.toLowerCase(), (counts.get(value.toLowerCase()) ?? 0) + 1));
  return Array.from(counts.entries()).filter(([, count]) => count > 1).map(([value]) => value);
}

export function initialImportStatus(errors: number, total: number) {
  if (total === 0) return "FAILED" as const;
  return errors > 0 ? "COMPLETED_WITH_ERRORS" as const : "PENDING" as const;
}

export function initialAssetStatus(): AssetStatus {
  return "AVAILABLE";
}

export function absoluteSpecifications(row: AbsoluteNormalizedRow): Prisma.InputJsonObject {
  return {
    source: "ABSOLUTE",
    user: row.user,
    email: row.email,
    operatingSystem: row.operatingSystem,
    lastSeen: row.lastSeen,
    importedAt: new Date().toISOString(),
  };
}
