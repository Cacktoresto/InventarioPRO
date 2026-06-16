import type React from "react";
import { Card, PageTitle } from "@/components/ui";
import { locationTypes, locationTypeLabels, locationTypeValue, type LocationTypeValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createLocation, deleteLocation, updateLocation } from "./actions";

export const dynamic = "force-dynamic";

async function getLocations() {
  return prisma.location.findMany({ include: { parentLocation: true }, orderBy: { name: "asc" } });
}

type LocationRecord = Awaited<ReturnType<typeof getLocations>>[number];
type LocationOption = Pick<LocationRecord, "id" | "name">;

export default async function LocationsPage() {
  const locations = await getLocations();
  return (
    <>
      <PageTitle title="Localizações" description="CRUD completo de bases, lojas e áreas internas." />
      <Card>
        <h2 className="mb-3 font-semibold">Nova localização</h2>
        <form action={createLocation} className="grid gap-3 md:grid-cols-3">
          <Input name="name" placeholder="Nome" required />
          <Input name="code" placeholder="Código" required />
          <TypeSelect />
          <Input name="address" placeholder="Endereço" />
          <ParentSelect locations={locations} />
          <label className="flex items-center gap-2 text-sm"><input name="isGovernanceBase" type="checkbox" />Base de governança</label>
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-white">Criar</button>
        </form>
      </Card>
      <div className="mt-5 space-y-3">
        {locations.map((location: LocationRecord) => (
          <Card key={location.id}>
            <form action={updateLocation} className="grid gap-3 md:grid-cols-8">
              <input type="hidden" name="id" value={location.id} />
              <Input name="name" defaultValue={location.name} />
              <Input name="code" defaultValue={location.code} />
              <TypeSelect defaultValue={locationTypeValue(location.type)} />
              <Input name="address" defaultValue={location.address ?? ""} />
              <ParentSelect locations={locations.filter((option: LocationRecord) => option.id !== location.id)} defaultValue={location.parentLocationId ?? ""} />
              <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={location.active} />Ativa</label>
              <label className="flex items-center gap-2 text-sm"><input name="isGovernanceBase" type="checkbox" defaultChecked={location.isGovernanceBase} />Governança</label>
              <button className="rounded-xl border px-3 py-2">Salvar</button>
            </form>
            <p className="mt-2 text-sm text-slate-500">Pai: {location.parentLocation?.name ?? "—"}</p>
            <form action={deleteLocation} className="mt-2">
              <input type="hidden" name="id" value={location.id} />
              <button className="text-sm text-red-700">Excluir</button>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="rounded-xl border border-slate-300 px-3 py-2" />;
}

function TypeSelect({ defaultValue }: { defaultValue?: LocationTypeValue }) {
  return (
    <select name="type" defaultValue={defaultValue} className="rounded-xl border p-2">
      {locationTypes.map((type: LocationTypeValue) => <option key={type} value={type}>{locationTypeLabels[type]}</option>)}
    </select>
  );
}

function ParentSelect({ locations, defaultValue = "" }: { locations: LocationOption[]; defaultValue?: string }) {
  return (
    <select name="parentLocationId" defaultValue={defaultValue} className="rounded-xl border p-2">
      <option value="">Sem pai</option>
      {locations.map((location: LocationOption) => <option key={location.id} value={location.id}>{location.name}</option>)}
    </select>
  );
}
