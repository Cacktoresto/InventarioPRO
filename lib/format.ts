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
export const termTypes = ["HANDOVER", "RETURN", "TRANSFER", "REGULARIZATION"] as const;
export const termStatuses = ["DRAFT", "ISSUED", "ACCEPTED", "REVOKED", "EXPIRED"] as const;

export type AssetStatusValue = (typeof assetStatuses)[number];
export type AssetTypeValue = (typeof assetTypes)[number];
export type LocationTypeValue = (typeof locationTypes)[number];
export type MovementTypeValue = (typeof movementTypes)[number];
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
  HANDOVER: "Entrega",
  RETURN: "Devolução",
  TRANSFER: "Transferência",
  MAINTENANCE_SEND: "Envio manutenção",
  MAINTENANCE_RETURN: "Retorno manutenção",
  DISPOSAL_SEND: "Envio descarte",
  INVENTORY_ADJUSTMENT: "Ajuste inventário",
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

export function formatDate(date?: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date) : "—";
}
