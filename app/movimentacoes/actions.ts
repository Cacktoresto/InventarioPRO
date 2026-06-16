"use server";

import { redirect } from "next/navigation";
import type { AssetStatus, MovementType, Prisma } from "@prisma/client";
import { buildListUrl, optionalText, prismaErrorMessage, requiredText } from "@/lib/crud";
import { prisma } from "@/lib/prisma";
import { movementFormTypes, type MovementFormType } from "@/lib/format";

function isMovementFormType(value: string): value is MovementFormType {
  return (movementFormTypes as readonly string[]).includes(value);
}

function movementType(value: MovementFormType): MovementType {
  const map: Record<MovementFormType, MovementType> = {
    ENTRADA_ESTOQUE: "INVENTORY_ADJUSTMENT",
    ENTREGA_USUARIO: "HANDOVER",
    TRANSFERENCIA_LOCAL: "TRANSFER",
    DEVOLUCAO: "RETURN",
    ENVIO_MANUTENCAO: "MAINTENANCE_SEND",
    RETORNO_MANUTENCAO: "MAINTENANCE_RETURN",
    DESCARTE: "DISPOSAL_SEND",
  };
  return map[value];
}

function nextStatus(value: MovementFormType, current: AssetStatus): AssetStatus {
  const map: Partial<Record<MovementFormType, AssetStatus>> = {
    ENTRADA_ESTOQUE: "AVAILABLE",
    ENTREGA_USUARIO: "ASSIGNED",
    DEVOLUCAO: "AVAILABLE",
    ENVIO_MANUTENCAO: "IN_MAINTENANCE",
    RETORNO_MANUTENCAO: "AVAILABLE",
    DESCARTE: "DISPOSED",
  };
  return map[value] ?? current;
}

export async function createMovement(formData: FormData): Promise<void> {
  const assetId = requiredText(formData, "assetId", "Ativo");
  const rawType = requiredText(formData, "type", "Tipo de movimentação");
  if (!isMovementFormType(rawType)) {
    redirect(buildListUrl("/movimentacoes/nova", "error", "Tipo de movimentação inválido."));
  }

  const toLocationId = optionalText(formData, "toLocationId");
  const toResponsibleId = optionalText(formData, "toResponsibleId");
  const fromLocationId = optionalText(formData, "fromLocationId");
  const reason = optionalText(formData, "reason");
  const destination = optionalText(formData, "destination");
  const occurredAtText = optionalText(formData, "occurredAt");
  const occurredAt = occurredAtText ? new Date(occurredAtText) : new Date();

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const asset = await tx.asset.findUnique({ where: { id: assetId }, select: { id: true, status: true, currentLocationId: true, currentResponsibleId: true } });
      if (!asset) throw new Error("Ativo não encontrado.");

      const updateData: Prisma.AssetUpdateInput = { status: nextStatus(rawType, asset.status) };
      if (["ENTRADA_ESTOQUE", "TRANSFERENCIA_LOCAL", "DEVOLUCAO", "RETORNO_MANUTENCAO"].includes(rawType) && toLocationId) updateData.currentLocation = { connect: { id: toLocationId } };
      if (rawType === "ENTREGA_USUARIO") {
        if (!toResponsibleId) throw new Error("Responsável/Pessoa é obrigatório para entrega ao usuário.");
        updateData.currentResponsible = { connect: { id: toResponsibleId } };
        if (toLocationId) updateData.currentLocation = { connect: { id: toLocationId } };
      }
      if (rawType === "DEVOLUCAO") updateData.currentResponsible = { disconnect: true };
      if (rawType === "DESCARTE") updateData.currentResponsible = { disconnect: true };

      const movement = await tx.assetMovement.create({ data: { assetId, type: movementType(rawType), fromLocationId: fromLocationId ?? asset.currentLocationId, toLocationId, fromResponsibleId: asset.currentResponsibleId, toResponsibleId, requestedAt: occurredAt, executedAt: occurredAt, reason, conditionNotes: destination } });
      await tx.asset.update({ where: { id: assetId }, data: updateData });
      await tx.auditEvent.create({ data: { entityType: "AssetMovement", entityId: movement.id, eventType: "ASSET_MOVEMENT_CREATED", occurredAt, afterPayload: { assetId, movementType: rawType, toLocationId, toResponsibleId, destination, reason } } });
    });
  } catch (error) {
    redirect(buildListUrl("/movimentacoes/nova", "error", prismaErrorMessage(error, "Não foi possível criar a movimentação.")));
  }
  redirect(buildListUrl("/movimentacoes", "success", "Movimentação criada com sucesso."));
}
