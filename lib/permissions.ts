import type { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "ADMIN",
  TI_CD: "TI/CD",
  SUPORTE_LOJAS: "Suporte Lojas",
  GESTOR: "Gestor",
  CONSULTA: "Consulta",
};

const roleRoutes: Record<UserRole, string[]> = {
  ADMIN: ["/"],
  TI_CD: ["/", "/ativos", "/pessoas", "/localizacoes", "/movimentacoes", "/termos"],
  SUPORTE_LOJAS: ["/", "/ativos", "/movimentacoes", "/termos"],
  GESTOR: ["/", "/auditoria", "/configuracoes"],
  CONSULTA: ["/", "/ativos", "/pessoas", "/localizacoes", "/movimentacoes", "/termos"],
};

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (role === "ADMIN") return true;
  return roleRoutes[role].some((route) => route === "/" ? pathname === "/" : pathname.startsWith(route));
}

export function canWrite(role: UserRole): boolean {
  return role === "ADMIN" || role === "TI_CD" || role === "SUPORTE_LOJAS";
}
