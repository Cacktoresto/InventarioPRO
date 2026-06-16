"use server";

import { redirect } from "next/navigation";
import { locationTypes, type LocationTypeValue } from "@/lib/format";
import { buildListUrl, optionalText, prismaErrorMessage, requiredText, requireId } from "@/lib/crud";
import { prisma } from "@/lib/prisma";

function isLocationType(value: string): value is LocationTypeValue {
  return (locationTypes as readonly string[]).includes(value);
}

function locationType(formData: FormData): LocationTypeValue {
  const value = requiredText(formData, "type", "Tipo");
  if (!isLocationType(value)) throw new Error("Tipo é obrigatório.");
  return value;
}

function locationData(formData: FormData) {
  return {
    name: requiredText(formData, "name", "Nome"),
    code: requiredText(formData, "code", "Código"),
    type: locationType(formData),
    address: optionalText(formData, "address"),
    parentLocationId: optionalText(formData, "parentLocationId"),
    isGovernanceBase: formData.get("isGovernanceBase") === "on",
  };
}

export async function createLocation(formData: FormData): Promise<void> {
  try {
    await prisma.location.create({ data: locationData(formData) });
  } catch (error) {
    redirect(buildListUrl("/localizacoes", "error", prismaErrorMessage(error, "Não foi possível criar a localização.")));
  }
  redirect(buildListUrl("/localizacoes", "success", "Localização criada com sucesso."));
}

export async function updateLocation(formData: FormData): Promise<void> {
  const id = requireId(formData);
  try {
    await prisma.location.update({ where: { id }, data: { ...locationData(formData), active: formData.get("active") === "on" } });
  } catch (error) {
    redirect(buildListUrl("/localizacoes", "error", prismaErrorMessage(error, "Não foi possível salvar a localização.")));
  }
  redirect(buildListUrl("/localizacoes", "success", "Localização atualizada com sucesso."));
}

export async function deleteLocation(formData: FormData): Promise<void> {
  const id = requireId(formData);
  const linked = await prisma.location.findUnique({
    where: { id },
    select: { _count: { select: { childLocations: true, people: true, assets: true, fromMovements: true, toMovements: true } } },
  });

  if (!linked) redirect(buildListUrl("/localizacoes", "error", "Localização não encontrada."));
  if (Object.values(linked._count).some((count) => Number(count) > 0)) {
    redirect(buildListUrl("/localizacoes", "error", "Não é possível excluir esta localização porque ela possui pessoas, ativos, filhas ou movimentações vinculadas."));
  }

  try {
    await prisma.location.delete({ where: { id } });
  } catch (error) {
    redirect(buildListUrl("/localizacoes", "error", prismaErrorMessage(error, "Não foi possível excluir a localização.")));
  }
  redirect(buildListUrl("/localizacoes", "success", "Localização excluída com sucesso."));
}
