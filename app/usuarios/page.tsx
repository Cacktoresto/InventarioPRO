import { redirect } from "next/navigation";
import { ActionButtons, Alert, Badge, Button, Card, Input, PageHeader, Select, Table } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { roleLabels } from "@/lib/permissions";
import { createUser, resetPassword, toggleUserActive, updateUser } from "./actions";

type Params = { result?: string; message?: string };
const roles = ["ADMIN", "TI_CD", "SUPORTE_LOJAS", "GESTOR", "CONSULTA"] as const;

export default async function UsersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const [current, params] = await Promise.all([requireUser("/usuarios"), searchParams]);
  if (current.role !== "ADMIN") redirect("/");
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return <><PageHeader title="Usuários" description="Administre contas, perfis de acesso, status e redefinição de senhas." /><div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]"><Card><h2 className="mb-4 text-lg font-semibold text-slate-950">Criar usuário</h2>{params.message ? <Alert status={params.result} message={params.message} /> : null}<form action={createUser} className="grid gap-4"><Input name="name" label="Nome" required /><Input name="email" label="E-mail" type="email" required /><Select name="role" label="Perfil" defaultValue="CONSULTA">{roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</Select><Input name="password" label="Senha inicial" type="password" minLength={6} required /><Button>Criar usuário</Button></form></Card><Card><Table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Último login</th><th>Ações</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td className="font-semibold text-slate-950">{user.name}</td><td>{user.email}</td><td>{roleLabels[user.role]}</td><td><Badge tone={user.isActive ? "green" : "slate"}>{user.isActive ? "Ativo" : "Inativo"}</Badge></td><td>{user.lastLoginAt ? user.lastLoginAt.toLocaleString("pt-BR") : "—"}</td><td><div className="grid gap-3"><form action={updateUser} className="grid gap-2 rounded-xl bg-slate-50 p-3"><input type="hidden" name="id" value={user.id} /><Input name="name" label="Nome" defaultValue={user.name} required /><Input name="email" label="E-mail" type="email" defaultValue={user.email} required /><Select name="role" label="Perfil" defaultValue={user.role}>{roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}</Select><Button variant="secondary">Salvar</Button></form><ActionButtons><form action={toggleUserActive}><input type="hidden" name="id" value={user.id} /><Button variant={user.isActive ? "danger" : "secondary"}>{user.isActive ? "Desativar" : "Ativar"}</Button></form><form action={resetPassword} className="flex gap-2"><input type="hidden" name="id" value={user.id} /><input className="w-36 rounded-xl border border-slate-300 px-3 py-2 text-sm" name="password" type="password" minLength={6} placeholder="Nova senha" required /><Button variant="secondary">Redefinir</Button></form></ActionButtons></div></td></tr>)}</tbody></Table></Card></div></>;
}
