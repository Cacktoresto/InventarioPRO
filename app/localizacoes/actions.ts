"use server";
import { LocationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
function text(formData: FormData, key: string) { const value = String(formData.get(key) ?? "").trim(); return value || null; }
export async function createLocation(formData: FormData) { await prisma.location.create({ data: { name: String(formData.get("name")), code: String(formData.get("code")), type: formData.get("type") as LocationType, address: text(formData, "address"), parentLocationId: text(formData, "parentLocationId"), isGovernanceBase: formData.get("isGovernanceBase") === "on" } }); revalidatePath("/localizacoes"); }
export async function updateLocation(formData: FormData) { await prisma.location.update({ where: { id: String(formData.get("id")) }, data: { name: String(formData.get("name")), code: String(formData.get("code")), type: formData.get("type") as LocationType, address: text(formData, "address"), parentLocationId: text(formData, "parentLocationId"), active: formData.get("active") === "on", isGovernanceBase: formData.get("isGovernanceBase") === "on" } }); revalidatePath("/localizacoes"); }
export async function deleteLocation(formData: FormData) { await prisma.location.delete({ where: { id: String(formData.get("id")) } }); revalidatePath("/localizacoes"); }
