import type React from "react";
import { Card, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { createPerson, deletePerson, updatePerson } from "./actions";

async function getPeopleData() {
  const [people, locations] = await Promise.all([
    prisma.person.findMany({ include: { location: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { people, locations };
}

type PeopleData = Awaited<ReturnType<typeof getPeopleData>>;
type PersonRecord = PeopleData["people"][number];
type PersonLocationRecord = PeopleData["locations"][number];

export default async function PeoplePage() {
  const { people, locations } = await getPeopleData();
  return (
    <>
      <PageTitle title="Pessoas" description="CRUD completo de colaboradores e responsáveis." />
      <Card>
        <h2 className="mb-3 font-semibold">Nova pessoa</h2>
        <form action={createPerson} className="grid gap-3 md:grid-cols-3">
          <Input name="name" placeholder="Nome" required />
          <Input name="email" placeholder="E-mail" />
          <Input name="employeeCode" placeholder="Matrícula" />
          <Input name="document" placeholder="Documento" />
          <Input name="department" placeholder="Departamento" />
          <LocationSelect locations={locations} />
          <input type="hidden" name="personType" value="EMPLOYEE" />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-white">Criar</button>
        </form>
      </Card>
      <div className="mt-5 space-y-3">
        {people.map((person: PersonRecord) => (
          <Card key={person.id}>
            <form action={updatePerson} className="grid gap-3 md:grid-cols-7">
              <input type="hidden" name="id" value={person.id} />
              <Input name="name" defaultValue={person.name} />
              <Input name="email" defaultValue={person.email ?? ""} />
              <Input name="employeeCode" defaultValue={person.employeeCode ?? ""} />
              <Input name="document" defaultValue={person.document ?? ""} />
              <Input name="department" defaultValue={person.department ?? ""} />
              <LocationSelect locations={locations} defaultValue={person.locationId ?? ""} />
              <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={person.active} />Ativo</label>
              <button className="rounded-xl border px-3 py-2">Salvar</button>
            </form>
            <form action={deletePerson} className="mt-2">
              <input type="hidden" name="id" value={person.id} />
              <button className="text-sm text-red-700">Excluir</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}

function LocationSelect({ locations, defaultValue = "" }: { locations: PersonLocationRecord[]; defaultValue?: string }) {
  return (
    <select name="locationId" defaultValue={defaultValue} className="rounded-xl border p-2">
      <option value="">Sem localização</option>
      {locations.map((location: PersonLocationRecord) => <option key={location.id} value={location.id}>{location.name}</option>)}
    </select>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-xl border border-slate-300 px-3 py-2" />;
}
