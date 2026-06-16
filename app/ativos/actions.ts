"use server";

import { redirect } from "next/navigation";
import { assetStatuses, assetTypes, type AssetStatusValue, type AssetTypeValue } from "@/lib/format";
import { buildListUrl, optionalText, prismaErrorMessage, requiredText, requireId } from "@/lib/crud";
import { prisma } from "@/lib/prisma";

function isOneOf<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return (values as readonly string[]).includes(value);
}

function assetType(formData: FormData): AssetTypeValue {
  const value = requiredText(formData, "type", "Tipo");
  if (!isOneOf(assetTypes, value)) throw new Error("Tipo é obrigatório.");
  return value;
}

function assetStatus(formData: FormData): AssetStatusValue {
  const value = requiredText(formData, "status", "Status");
  if (!isOneOf(assetStatuses, value)) throw new Error("Status é obrigatório.");
  return value;
}

function assetData(formData: FormData) {
  return {
    assetTag: requiredText(formData, "assetTag", "Nome"),
    serialNumber: requiredText(formData, "serialNumber", "Serial"),
    type: assetType(formData),
    status: assetStatus(formData),
    currentLocationId: requiredText(formData, "currentLocationId", "Localização"),
    currentResponsibleId: optionalText(formData, "currentResponsibleId"),
    hostname: optionalText(formData, "hostname"),
    brand: optionalText(formData, "brand"),
    model: optionalText(formData, "model"),
  };
}

export async function createAsset(formData: FormData): Promise<void> {
  try {
    await prisma.asset.create({ data: assetData(formData) });
  } catch (error) {
    redirect(buildListUrl("/ativos/novo", "error", prismaErrorMessage(error, "Não foi possível criar o ativo.")));
  }
  redirect(buildListUrl("/ativos", "success", "Ativo criado com sucesso."));
}

export async function updateAsset(formData: FormData): Promise<void> {
  const id = requireId(formData);
  try {
    await prisma.asset.update({ where: { id }, data: assetData(formData) });
  } catch (error) {
    redirect(buildListUrl(`/ativos/${id}/editar`, "error", prismaErrorMessage(error, "Não foi possível salvar o ativo.")));
  }
  redirect(buildListUrl("/ativos", "success", "Ativo atualizado com sucesso."));
}

export async function deleteAsset(formData: FormData): Promise<void> {
  const id = requireId(formData);
  const linked = await prisma.asset.findUnique({
    where: { id },
    select: {
      _count: { select: { assignments: true, movements: true, maintenanceOrders: true, disposalRequests: true, responsibilityTerms: true, importRows: true } },
    },
  });

  if (!linked) redirect(buildListUrl("/ativos", "error", "Ativo não encontrado."));

  const hasLinks = Object.values(linked._count).some((count) => Number(count) > 0);
  if (hasLinks) redirect(buildListUrl("/ativos", "error", "Não é possível excluir este ativo porque ele possui vínculos, movimentações ou histórico."));

  try {
    await prisma.asset.delete({ where: { id } });
  } catch (error) {
    redirect(buildListUrl("/ativos", "error", prismaErrorMessage(error, "Não foi possível excluir o ativo.")));
  }
  redirect(buildListUrl("/ativos", "success", "Ativo excluído com sucesso."));
}
