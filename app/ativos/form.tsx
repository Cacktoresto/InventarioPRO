import type React from "react";
import { assetStatuses, assetStatusLabels, assetTypes, assetTypeLabels, type AssetStatusValue, type AssetTypeValue } from "@/lib/format";

type AssetFormData = {
  assetTag: string;
  serialNumber: string | null;
  type: AssetTypeValue;
  status: AssetStatusValue;
  currentLocationId: string;
  currentResponsibleId: string | null;
  hostname: string | null;
  brand: string | null;
  model: string | null;
};

type LocationOption = { id: string; name: string; code: string };
type PersonOption = { id: string; name: string; email: string | null };

type AssetFormProps = {
  action: (formData: FormData) => Promise<void>;
  asset?: AssetFormData & { id: string };
  locations: LocationOption[];
  people: PersonOption[];
  submitLabel: string;
};

export function AssetForm({ action, asset, locations, people, submitLabel }: AssetFormProps) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      {asset ? <input type="hidden" name="id" value={asset.id} /> : null}
      <Input name="assetTag" label="Nome / etiqueta" defaultValue={asset?.assetTag ?? ""} required />
      <Input name="serialNumber" label="Serial" defaultValue={asset?.serialNumber ?? ""} required />
      <Select name="type" label="Tipo" defaultValue={asset?.type ?? ""} required>
        <option value="">Selecione</option>
        {assetTypes.map((type: AssetTypeValue) => <option key={type} value={type}>{assetTypeLabels[type]}</option>)}
      </Select>
      <Select name="status" label="Status" defaultValue={asset?.status ?? "AVAILABLE"} required>
        {assetStatuses.map((status: AssetStatusValue) => <option key={status} value={status}>{assetStatusLabels[status]}</option>)}
      </Select>
      <Select name="currentLocationId" label="Localização" defaultValue={asset?.currentLocationId ?? ""} required>
        <option value="">Selecione</option>
        {locations.map((location) => <option key={location.id} value={location.id}>{location.name} ({location.code})</option>)}
      </Select>
      <Select name="currentResponsibleId" label="Responsável" defaultValue={asset?.currentResponsibleId ?? ""}>
        <option value="">Sem responsável</option>
        {people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.email ? ` — ${person.email}` : ""}</option>)}
      </Select>
      <Input name="hostname" label="Hostname" defaultValue={asset?.hostname ?? ""} />
      <Input name="brand" label="Marca" defaultValue={asset?.brand ?? ""} />
      <Input name="model" label="Modelo" defaultValue={asset?.model ?? ""} />
      <div className="md:col-span-2">
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-white">{submitLabel}</button>
      </div>
    </form>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700"><span>{label}</span><input {...props} className="rounded-xl border border-slate-300 px-3 py-2 font-normal" /></label>;
}

function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className="grid gap-1 text-sm font-medium text-slate-700"><span>{label}</span><select {...props} className="rounded-xl border border-slate-300 px-3 py-2 font-normal">{children}</select></label>;
}
