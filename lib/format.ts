import type { AssetStatus, AssetType, LocationType, MovementType, TermStatus, TermType } from "@prisma/client";

export const assetStatusLabels: Record<AssetStatus, string> = {
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

export const assetTypeLabels: Record<AssetType, string> = {
  NOTEBOOK: "Notebook", DESKTOP: "Desktop", MONITOR: "Monitor", PRINTER: "Impressora", HANDHELD: "Coletor", MOBILE_PHONE: "Celular", PERIPHERAL: "Periférico", SERVER: "Servidor", NETWORK: "Rede", OTHER: "Outro",
};

export const locationTypeLabels: Record<LocationType, string> = {
  DISTRIBUTION_CENTER: "Centro de distribuição", HEADQUARTERS: "Sede", STORE: "Loja", INTERNAL_AREA: "Área interna", TECHNICAL_ASSISTANCE: "Assistência técnica", SUPPLIER: "Fornecedor", DISPOSAL_AREA: "Área de descarte", TRANSIT: "Trânsito",
};

export const movementTypeLabels: Record<MovementType, string> = {
  HANDOVER: "Entrega", RETURN: "Devolução", TRANSFER: "Transferência", MAINTENANCE_SEND: "Envio manutenção", MAINTENANCE_RETURN: "Retorno manutenção", DISPOSAL_SEND: "Envio descarte", INVENTORY_ADJUSTMENT: "Ajuste inventário",
};

export const termTypeLabels: Record<TermType, string> = { HANDOVER: "Entrega", RETURN: "Devolução", TRANSFER: "Transferência", REGULARIZATION: "Regularização" };
export const termStatusLabels: Record<TermStatus, string> = { DRAFT: "Rascunho", ISSUED: "Emitido", ACCEPTED: "Aceito", REVOKED: "Revogado", EXPIRED: "Expirado" };

export function formatDate(date?: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date) : "—";
}
