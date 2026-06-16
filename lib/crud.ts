export type ActionStatus = "success" | "error";

type PrismaKnownErrorLike = {
  code?: string;
};

export function requiredText(formData: FormData, key: string, label: string): string {
  const value = optionalText(formData, key);
  if (!value) {
    throw new Error(`${label} é obrigatório.`);
  }
  return value;
}

export function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

export function requireId(formData: FormData): string {
  return requiredText(formData, "id", "Identificador");
}

export function buildListUrl(path: string, status: ActionStatus, message: string): string {
  const params = new URLSearchParams({ result: status, message });
  return `${path}?${params.toString()}`;
}

export function prismaErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.endsWith("é obrigatório.")) {
    return error.message;
  }

  const prismaError = typeof error === "object" && error !== null ? (error as PrismaKnownErrorLike) : null;
  if (prismaError?.code === "P2002") {
    return "Já existe um cadastro com um valor único informado. Verifique campos como código, serial, e-mail, documento ou matrícula.";
  }

  if (prismaError?.code === "P2003") {
    return "Não foi possível salvar porque um vínculo informado não existe mais.";
  }

  if (prismaError?.code === "P2025") {
    return "Registro não encontrado. Atualize a página e tente novamente.";
  }

  return fallback;
}
