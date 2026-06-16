"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function text(formData: FormData, key: string) { const value = String(formData.get(key) ?? "").trim(); return value || null; }
export async function createPerson(formData: FormData) { await prisma.person.create({ data: { name: String(formData.get("name")), email: text(formData, "email"), document: text(formData, "document"), employeeCode: text(formData, "employeeCode"), department: text(formData, "department"), personType: String(formData.get("personType") || "EMPLOYEE"), locationId: text(formData, "locationId") } }); revalidatePath("/pessoas"); }
export async function updatePerson(formData: FormData) { await prisma.person.update({ where: { id: String(formData.get("id")) }, data: { name: String(formData.get("name")), email: text(formData, "email"), document: text(formData, "document"), employeeCode: text(formData, "employeeCode"), department: text(formData, "department"), active: formData.get("active") === "on", locationId: text(formData, "locationId") } }); revalidatePath("/pessoas"); }
export async function deletePerson(formData: FormData) { await prisma.person.delete({ where: { id: String(formData.get("id")) } }); revalidatePath("/pessoas"); }
