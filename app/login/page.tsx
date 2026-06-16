import { Alert, Button, Card, Input } from "@/components/ui";
import { loginAction } from "./actions";

type Params = { result?: string; message?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  return <div className="mx-auto flex min-h-[70vh] max-w-md items-center"><Card className="w-full"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">InventarioPRO</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Entrar no portal</h1><p className="mt-2 text-sm text-slate-600">Use seu e-mail e senha cadastrados pelo administrador.</p></div>{params.message ? <Alert status={params.result} message={params.message} /> : null}<form action={loginAction} className="grid gap-4"><Input name="email" label="E-mail" type="email" autoComplete="email" required /><Input name="password" label="Senha" type="password" autoComplete="current-password" required /><Button>Entrar</Button></form></Card></div>;
}
