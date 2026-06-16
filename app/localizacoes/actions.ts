"use server";
import { revalidatePath } from "next/cache";
import { locationTypes, type LocationTypeValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
function text(formData: FormData, key: string) { const value = String(formData.get(key) ?? "").trim(); return value || null; }
function locationType(formData: FormData): LocationTypeValue { const value = String(formData.get("type") ?? ""); return locationTypes.includes(value as LocationTypeValue) ? (value as LocationTypeValue) : "INTERNAL_AREA"; }
export async function createLocation(formData: FormData) { await prisma.location.create({ data: { name: String(formData.get("name")), code: String(formData.get("code")), type: locationType(formData), address: text(formData, "address"), parentLocationId: text(formData, "parentLocationId"), isGovernanceBase: formData.get("isGovernanceBase") === "on" } }); revalidatePath("/localizacoes"); }
export async function updateLocation(formData: FormData) { await prisma.location.update({ where: { id: String(formData.get("id")) }, data: { name: String(formData.get("name")), code: String(formData.get("code")), type: locationType(formData), address: text(formData, "address"), parentLocationId: text(formData, "parentLocationId"), active: formData.get("active") === "on", isGovernanceBase: formData.get("isGovernanceBase") === "on" } }); revalidatePath("/localizacoes"); }
export async function deleteLocation(formData: FormData) { await prisma.location.delete({ where: { id: String(formData.get("id")) } }); revalidatePath("/localizacoes"); }
