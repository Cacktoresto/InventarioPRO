"use server";

import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const roles: UserRole[] = ["ADMIN", "TI_CD", "SUPORTE_LOJAS", "GESTOR", "CONSULTA"];
function roleFromForm(value: FormDataEntryValue | null): UserRole { return roles.includes(value as UserRole) ? value as UserRole : "CONSULTA"; }
function text(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }

async function audit(eventType: string, entityId: string, actorUserId: string, beforePayload: object | null, afterPayload: object | null) {
  await prisma.auditEvent.create({ data: { entityType: "User", entityId, eventType, actorUserId, beforePayload: beforePayload ?? undefined, afterPayload: afterPayload ?? undefined } });
}

export async function createUser(formData: FormData): Promise<void> {
  const actor = await requireUser("/usuarios");
  if (actor.role !== "ADMIN") redirect("/?result=error&message=Acesso%20negado");
  const password = text(formData, "password");
  const data = { name: text(formData, "name"), email: text(formData, "email").toLowerCase(), role: roleFromForm(formData.get("role")), passwordHash: hashPassword(password), isActive: true };
  if (!data.name || !data.email || password.length < 6) redirect("/usuarios?result=error&message=Informe%20nome,%20e-mail%20e%20senha%20com%206%2B%20caracteres");
  const user = await prisma.user.create({ data });
  await audit("USER_CREATED", user.id, actor.id, null, { name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  redirect("/usuarios?result=success&message=Usu%C3%A1rio%20criado");
}

export async function updateUser(formData: FormData): Promise<void> {
  const actor = await requireUser("/usuarios");
  if (actor.role !== "ADMIN") redirect("/?result=error&message=Acesso%20negado");
  const id = text(formData, "id");
  const before = await prisma.user.findUniqueOrThrow({ where: { id } });
  const user = await prisma.user.update({ where: { id }, data: { name: text(formData, "name"), email: text(formData, "email").toLowerCase(), role: roleFromForm(formData.get("role")) } });
  await audit("USER_UPDATED", id, actor.id, { name: before.name, email: before.email, role: before.role }, { name: user.name, email: user.email, role: user.role });
  redirect("/usuarios?result=success&message=Usu%C3%A1rio%20atualizado");
}

export async function toggleUserActive(formData: FormData): Promise<void> {
  const actor = await requireUser("/usuarios");
  if (actor.role !== "ADMIN") redirect("/?result=error&message=Acesso%20negado");
  const id = text(formData, "id");
  const before = await prisma.user.findUniqueOrThrow({ where: { id } });
  const user = await prisma.user.update({ where: { id }, data: { isActive: !before.isActive } });
  await audit(user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED", id, actor.id, { isActive: before.isActive }, { isActive: user.isActive });
  redirect("/usuarios?result=success&message=Status%20atualizado");
}

export async function resetPassword(formData: FormData): Promise<void> {
  const actor = await requireUser("/usuarios");
  if (actor.role !== "ADMIN") redirect("/?result=error&message=Acesso%20negado");
  const id = text(formData, "id");
  const password = text(formData, "password");
  if (password.length < 6) redirect("/usuarios?result=error&message=Senha%20deve%20ter%206%2B%20caracteres");
  await prisma.user.update({ where: { id }, data: { passwordHash: hashPassword(password) } });
  await audit("USER_PASSWORD_RESET", id, actor.id, null, { passwordReset: true });
  redirect("/usuarios?result=success&message=Senha%20redefinida");
}
