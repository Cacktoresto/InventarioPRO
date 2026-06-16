export const assetStatuses = [
  "AVAILABLE",
  "ASSIGNED",
  "IN_TRANSIT",
  "IN_MAINTENANCE",
  "RESERVED",
  "DISPOSAL_REQUESTED",
  "DISPOSED",
  "LOST",
  "RETIRED",
] as const;

export const assetTypes = ["NOTEBOOK", "DESKTOP", "MONITOR", "PRINTER", "HANDHELD", "MOBILE_PHONE", "PERIPHERAL", "SERVER", "NETWORK", "OTHER"] as const;
export const locationTypes = ["DISTRIBUTION_CENTER", "HEADQUARTERS", "STORE", "INTERNAL_AREA", "TECHNICAL_ASSISTANCE", "SUPPLIER", "DISPOSAL_AREA", "TRANSIT"] as const;
export const movementTypes = ["HANDOVER", "RETURN", "TRANSFER", "MAINTENANCE_SEND", "MAINTENANCE_RETURN", "DISPOSAL_SEND", "INVENTORY_ADJUSTMENT"] as const;
export const movementFormTypes = ["ENTRADA_ESTOQUE", "ENTREGA_USUARIO", "TRANSFERENCIA_LOCAL", "DEVOLUCAO", "ENVIO_MANUTENCAO", "RETORNO_MANUTENCAO", "DESCARTE"] as const;
export const termTypes = ["HANDOVER", "RETURN", "TRANSFER", "REGULARIZATION"] as const;
export const termStatuses = ["DRAFT", "ISSUED", "ACCEPTED", "REVOKED", "EXPIRED"] as const;

export type AssetStatusValue = (typeof assetStatuses)[number];
export type AssetTypeValue = (typeof assetTypes)[number];
export type LocationTypeValue = (typeof locationTypes)[number];
export type MovementTypeValue = (typeof movementTypes)[number];
export type MovementFormType = (typeof movementFormTypes)[number];
export type TermTypeValue = (typeof termTypes)[number];
export type TermStatusValue = (typeof termStatuses)[number];

export const assetStatusLabels: Record<AssetStatusValue, string> = {
  AVAILABLE: "Em estoque",
  ASSIGNED: "Em uso",
  IN_TRANSIT: "Em trânsito",
  IN_MAINTENANCE: "Em manutenção",
  RESERVED: "Reservado",
  DISPOSAL_REQUESTED: "Descarte solicitado",
  DISPOSED: "Descartado",
  LOST: "Perdido",
  RETIRED: "Aposentado",
};

export const assetTypeLabels: Record<AssetTypeValue, string> = {
  NOTEBOOK: "Notebook",
  DESKTOP: "Desktop",
  MONITOR: "Monitor",
  PRINTER: "Impressora",
  HANDHELD: "Coletor",
  MOBILE_PHONE: "Celular",
  PERIPHERAL: "Periférico",
  SERVER: "Servidor",
  NETWORK: "Rede",
  OTHER: "Outro",
};

export const locationTypeLabels: Record<LocationTypeValue, string> = {
  DISTRIBUTION_CENTER: "Centro de distribuição",
  HEADQUARTERS: "Sede",
  STORE: "Loja",
  INTERNAL_AREA: "Área interna",
  TECHNICAL_ASSISTANCE: "Assistência técnica",
  SUPPLIER: "Fornecedor",
  DISPOSAL_AREA: "Área de descarte",
  TRANSIT: "Trânsito",
};

export const movementTypeLabels: Record<MovementTypeValue, string> = {
  HANDOVER: "ENTREGA_USUARIO",
  RETURN: "DEVOLUCAO",
  TRANSFER: "TRANSFERENCIA_LOCAL",
  MAINTENANCE_SEND: "ENVIO_MANUTENCAO",
  MAINTENANCE_RETURN: "RETORNO_MANUTENCAO",
  DISPOSAL_SEND: "DESCARTE",
  INVENTORY_ADJUSTMENT: "ENTRADA_ESTOQUE",
};

export const movementFormTypeLabels: Record<MovementFormType, string> = {
  ENTRADA_ESTOQUE: "Entrada em estoque",
  ENTREGA_USUARIO: "Entrega ao usuário",
  TRANSFERENCIA_LOCAL: "Transferência de local",
  DEVOLUCAO: "Devolução",
  ENVIO_MANUTENCAO: "Envio para manutenção",
  RETORNO_MANUTENCAO: "Retorno da manutenção",
  DESCARTE: "Descarte",
};

export const termTypeLabels: Record<TermTypeValue, string> = {
  HANDOVER: "Entrega",
  RETURN: "Devolução",
  TRANSFER: "Transferência",
  REGULARIZATION: "Regularização",
};

export const termStatusLabels: Record<TermStatusValue, string> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitido",
  ACCEPTED: "Aceito",
  REVOKED: "Revogado",
  EXPIRED: "Expirado",
};

function isOneOf<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return (values as readonly string[]).includes(value);
}

export function assetStatusLabel(value: string) {
  return isOneOf(assetStatuses, value) ? assetStatusLabels[value] : value;
}

export function assetTypeLabel(value: string) {
  return isOneOf(assetTypes, value) ? assetTypeLabels[value] : value;
}

export function locationTypeLabel(value: string) {
  return isOneOf(locationTypes, value) ? locationTypeLabels[value] : value;
}

export function locationTypeValue(value: string): LocationTypeValue {
  return isOneOf(locationTypes, value) ? value : "INTERNAL_AREA";
}

export function movementTypeLabel(value: string) {
  return isOneOf(movementTypes, value) ? movementTypeLabels[value] : value;
}

export function termTypeLabel(value: string) {
  return isOneOf(termTypes, value) ? termTypeLabels[value] : value;
}

export function termStatusLabel(value: string) {
  return isOneOf(termStatuses, value) ? termStatusLabels[value] : value;
}

export function formatDate(date?: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date) : "—";
}

export function statusBadgeTone(value: string): "slate" | "green" | "blue" | "amber" | "red" {
  if (value === "ASSIGNED") return "green";
  if (value === "AVAILABLE") return "blue";
  if (value === "IN_MAINTENANCE" || value === "RESERVED" || value === "IN_TRANSIT") return "amber";
  if (value === "DISPOSED" || value === "LOST" || value === "RETIRED" || value === "DISPOSAL_REQUESTED") return "red";
  return "slate";
}
