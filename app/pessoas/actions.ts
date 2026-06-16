"use server";

import { redirect } from "next/navigation";
import { buildListUrl, optionalText, prismaErrorMessage, requiredText, requireId } from "@/lib/crud";
import { prisma } from "@/lib/prisma";

function personData(formData: FormData) {
  return {
    name: requiredText(formData, "name", "Nome"),
    email: optionalText(formData, "email"),
    document: optionalText(formData, "document"),
    employeeCode: optionalText(formData, "employeeCode"),
    department: optionalText(formData, "department"),
    personType: optionalText(formData, "personType") ?? "EMPLOYEE",
    locationId: optionalText(formData, "locationId"),
  };
}

export async function createPerson(formData: FormData): Promise<void> {
  try {
    await prisma.person.create({ data: personData(formData) });
  } catch (error) {
    redirect(buildListUrl("/pessoas", "error", prismaErrorMessage(error, "Não foi possível criar a pessoa.")));
  }
  redirect(buildListUrl("/pessoas", "success", "Pessoa criada com sucesso."));
}

export async function updatePerson(formData: FormData): Promise<void> {
  const id = requireId(formData);
  try {
    await prisma.person.update({ where: { id }, data: { ...personData(formData), active: formData.get("active") === "on" } });
  } catch (error) {
    redirect(buildListUrl("/pessoas", "error", prismaErrorMessage(error, "Não foi possível salvar a pessoa.")));
  }
  redirect(buildListUrl("/pessoas", "success", "Pessoa atualizada com sucesso."));
}

export async function deletePerson(formData: FormData): Promise<void> {
  const id = requireId(formData);
  const linked = await prisma.person.findUnique({
    where: { id },
    select: { user: { select: { id: true } }, _count: { select: { responsibleAssets: true, assignments: true, responsibilityTerms: true } } },
  });

  if (!linked) redirect(buildListUrl("/pessoas", "error", "Pessoa não encontrada."));
  if (linked.user || Object.values(linked._count).some((count) => Number(count) > 0)) {
    redirect(buildListUrl("/pessoas", "error", "Não é possível excluir esta pessoa porque ela possui vínculos com ativos, termos ou usuário."));
  }

  try {
    await prisma.person.delete({ where: { id } });
  } catch (error) {
    redirect(buildListUrl("/pessoas", "error", prismaErrorMessage(error, "Não foi possível excluir a pessoa.")));
  }
  redirect(buildListUrl("/pessoas", "success", "Pessoa excluída com sucesso."));
}
