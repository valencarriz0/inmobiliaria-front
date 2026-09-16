import { useCallback, useEffect, useState, type FormEvent } from "react";
import PropertyChangeHistoryDialog from "../../components/PropertyChangeHistoryDialog";
import PropertyLocationCombobox from "../../components/PropertyLocationCombobox";
import { Badge } from "../../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { InputField } from "../../components/ui/input-field";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CURRENCIES, OPERATION_TYPES, PROPERTY_AMENITIES, PROPERTY_CONDITIONS, PROPERTY_SERVICES, PROPERTY_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { ApiError } from "../../services/api";
import { adminService } from "../../services/adminService";
import type { AdminProperty, AdminPropertyUpdate } from "../../types/admin";
import type { Currency, OperationType, PropertyAmenity, PropertyCondition, PropertyService } from "../../types/property";
import type { PropertySearchValues } from "../../types/property-search";

const propertyFilters = { page: "1", limit: "20" };
type PropertyAction = "pause" | "reactivate" | "delete";

type PropertyDraft = {
  id: string;
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: "house" | "apartment" | "commercial";
  price: string;
  currency: Currency;
  location: Pick<PropertySearchValues, "province" | "city" | "provinceId" | "cityId">;
  street: string;
  streetNumber: string;
  totalArea: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  age: string;
  propertyCondition: PropertyCondition | "";
  acceptsPets: "" | "yes" | "no";
  garage: string;
  expenses: string;
  taxes: string;
  commissions: string;
  latitude: string;
  longitude: string;
  serviceCodes: PropertyService[];
  amenityCodes: PropertyAmenity[];
};

function messageFrom(error: unknown) {
  return error instanceof ApiError ? error.message : "No se pudo completar la operación. Intentá nuevamente.";
}

function text(value: string | number | null | undefined) { return value == null ? "" : String(value); }
function optionalNumber(value: string) { return value.trim() === "" ? null : Number(value); }
function requiredNumber(value: string) { return Number(value); }
function codes<T extends string>(items: { code: string }[], allowed: Record<T, string>) {
  return items.map(({ code }) => code).filter((code): code is T => code in allowed);
}

function draftFrom(property: AdminProperty): PropertyDraft {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    operationType: property.operationType,
    propertyType: property.propertyType as PropertyDraft["propertyType"],
    price: text(property.price),
    currency: property.currency,
    location: {
      province: property.province?.name ?? "",
      city: property.city?.name ?? "",
      provinceId: property.province?.id ?? "",
      cityId: property.city?.id ?? "",
    },
    street: text(property.street), streetNumber: text(property.streetNumber), totalArea: text(property.totalArea), rooms: text(property.rooms),
    bedrooms: text(property.bedrooms), bathrooms: text(property.bathrooms), age: text(property.age),
    propertyCondition: (property.propertyCondition ?? "") as PropertyCondition | "",
    acceptsPets: property.acceptsPets == null ? "" : property.acceptsPets ? "yes" : "no",
    garage: text(property.garage), expenses: text(property.expenses), taxes: text(property.taxes), commissions: text(property.commissions),
    latitude: text(property.latitude), longitude: text(property.longitude),
    serviceCodes: codes(property.services, PROPERTY_SERVICES), amenityCodes: codes(property.amenities, PROPERTY_AMENITIES),
  };
}

function payloadFrom(draft: PropertyDraft): AdminPropertyUpdate {
  return {
    title: draft.title.trim(), description: draft.description.trim(), operationType: draft.operationType, propertyType: draft.propertyType,
    price: requiredNumber(draft.price), currency: draft.currency, cityId: draft.location.cityId,
    street: draft.street.trim() || null, streetNumber: draft.streetNumber.trim() || null,
    totalArea: requiredNumber(draft.totalArea), rooms: requiredNumber(draft.rooms), bedrooms: optionalNumber(draft.bedrooms),
    bathrooms: optionalNumber(draft.bathrooms), age: optionalNumber(draft.age), propertyCondition: draft.propertyCondition || null,
    acceptsPets: draft.acceptsPets === "" ? null : draft.acceptsPets === "yes", garage: optionalNumber(draft.garage),
    expenses: optionalNumber(draft.expenses), taxes: optionalNumber(draft.taxes), commissions: optionalNumber(draft.commissions),
    latitude: optionalNumber(draft.latitude), longitude: optionalNumber(draft.longitude), serviceCodes: draft.serviceCodes, amenityCodes: draft.amenityCodes,
  };
}

function isValidDraft(draft: PropertyDraft) {
  return Boolean(draft.title.trim() && draft.description.trim() && draft.location.cityId)
    && [draft.price, draft.totalArea, draft.rooms].every((value) => Number(value) > 0)
    && [draft.bedrooms, draft.bathrooms, draft.age, draft.garage, draft.expenses, draft.taxes, draft.commissions, draft.latitude, draft.longitude]
      .every((value) => value.trim() === "" || Number.isFinite(Number(value)));
}

function SelectField({ id, label, value, onChange, children, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; disabled: boolean }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="border-input dark:bg-input/30 flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50">{children}</select></div>;
}

export function AdminPropertiesSection() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [editorError, setEditorError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<AdminProperty | null>(null);
  const [pendingAction, setPendingAction] = useState<{ property: AdminProperty; action: PropertyAction } | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    setIsLoading(true); setError("");
    try { setProperties((await adminService.properties(propertyFilters)).properties); }
    catch (requestError) { setError(messageFrom(requestError)); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { void loadProperties(); }, [loadProperties]);

  const updateLocation = useCallback((location: PropertyDraft["location"]) => {
    setDraft((previous) => previous ? { ...previous, location } : previous);
  }, []);

  function replaceProperty(updated: AdminProperty) {
    setProperties((current) => current.map((property) => property.id === updated.id ? updated : property));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || isSaving) return;
    if (!isValidDraft(draft)) { setEditorError("Completá los campos obligatorios con valores válidos y elegí una localidad."); return; }
    setIsSaving(true); setEditorError(""); setNotice("");
    try {
      const result = await adminService.updateProperty(draft.id, payloadFrom(draft));
      replaceProperty(result.property); setDraft(null); setNotice("Publicación actualizada correctamente.");
    } catch (requestError) { setEditorError(messageFrom(requestError)); }
    finally { setIsSaving(false); }
  }

  async function confirmAction() {
    if (!pendingAction || actionId) return;
    const { property, action } = pendingAction;
    setActionId(property.id); setError(""); setNotice("");
    try {
      const result = action === "pause" ? await adminService.pauseProperty(property.id)
        : action === "reactivate" ? await adminService.reactivateProperty(property.id)
          : await adminService.deleteProperty(property.id);
      replaceProperty(result.property);
      setPendingAction(null);
      setNotice(action === "pause" ? "Publicación pausada correctamente." : action === "reactivate" ? "Publicación reactivada correctamente." : "Publicación eliminada correctamente.");
    } catch (requestError) { setError(messageFrom(requestError)); }
    finally { setActionId(null); }
  }

  const changing = Boolean(actionId);
  const actionCopy = pendingAction?.action === "pause" ? ["Pausar publicación", "La publicación dejará de estar visible hasta que la reactives.", "Pausar"]
    : pendingAction?.action === "reactivate" ? ["Reactivar publicación", "La publicación volverá a estar visible para las personas interesadas.", "Reactivar"]
      : ["Eliminar publicación", "La publicación se eliminará de forma lógica y dejará de estar visible.", "Eliminar"];

  return <section className="space-y-5" aria-labelledby="admin-properties-title">
    <div><h2 id="admin-properties-title" className="text-2xl font-bold">Publicaciones</h2><p className="text-muted-foreground">Editá datos, gestioná visibilidad y consultá el historial administrativo.</p></div>
    {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
    {error && <div className="space-y-3"><p role="alert">{error}</p><Button variant="outline" onClick={() => void loadProperties()} disabled={isLoading || changing}>Reintentar</Button></div>}
    {isLoading ? <p role="status">Cargando publicaciones...</p> : !error && properties.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No hay publicaciones para mostrar.</CardContent></Card> : <div className="grid gap-4">
      {properties.map((property) => <Card key={property.id}><CardHeader className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>{property.title}</CardTitle><Badge variant="outline">{PUBLICATION_STATUSES[property.publicationStatus]}</Badge></div><p className="text-sm text-muted-foreground">{property.city?.name ?? "Sin localidad"}{property.province?.name ? `, ${property.province.name}` : ""} · {property.currency} {property.price}</p></CardHeader><CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { setDraft(draftFrom(property)); setEditorError(""); }} disabled={changing}>Editar</Button>
        <Button variant="outline" onClick={() => setHistory(property)} disabled={changing}>Historial</Button>
        {property.publicationStatus === "active" && <Button variant="outline" onClick={() => setPendingAction({ property, action: "pause" })} disabled={changing}>Pausar</Button>}
        {property.publicationStatus === "paused" && <Button onClick={() => setPendingAction({ property, action: "reactivate" })} disabled={changing}>Reactivar</Button>}
        {property.publicationStatus !== "deleted" && <Button variant="destructive" onClick={() => setPendingAction({ property, action: "delete" })} disabled={changing}>Eliminar</Button>}
      </CardContent></Card>)}
    </div>}

    <Dialog open={Boolean(draft)} onOpenChange={(open) => { if (!open && !isSaving) setDraft(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>Editar publicación</DialogTitle><DialogDescription>Las imágenes no se modifican desde la administración.</DialogDescription></DialogHeader>
        {draft && <form className="space-y-5" onSubmit={save}>
          <fieldset disabled={isSaving} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><InputField id="admin-property-title" errorId="admin-property-title-error" label="Título" value={draft.title} required onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
            <div className="sm:col-span-2 space-y-2"><Label htmlFor="admin-property-description">Descripción</Label><Textarea id="admin-property-description" value={draft.description} required onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
            <SelectField id="admin-property-operation" label="Categoría" value={draft.operationType} onChange={(value) => setDraft({ ...draft, operationType: value as OperationType })} disabled={isSaving}>{Object.entries(OPERATION_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectField>
            <SelectField id="admin-property-type" label="Tipo de inmueble" value={draft.propertyType} onChange={(value) => setDraft({ ...draft, propertyType: value as PropertyDraft["propertyType"] })} disabled={isSaving}>{Object.entries(PROPERTY_TYPES).filter(([value]) => value !== "land").map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectField>
            <div className="sm:col-span-2 space-y-2"><Label>Localidad</Label><PropertyLocationCombobox value={draft.location} onChange={updateLocation} onBlur={() => undefined} error={draft.location.cityId ? undefined : "Seleccioná una localidad."} /></div>
            <InputField id="admin-property-street" errorId="admin-property-street-error" label="Calle" value={draft.street} onChange={(event) => setDraft({ ...draft, street: event.target.value })} />
            <InputField id="admin-property-number" errorId="admin-property-number-error" label="Altura" value={draft.streetNumber} onChange={(event) => setDraft({ ...draft, streetNumber: event.target.value })} />
            <InputField id="admin-property-price" errorId="admin-property-price-error" label="Precio" type="number" min="0.01" step="0.01" value={draft.price} required onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
            <SelectField id="admin-property-currency" label="Moneda" value={draft.currency} onChange={(value) => setDraft({ ...draft, currency: value as Currency })} disabled={isSaving}>{CURRENCIES.map((value) => <option key={value} value={value}>{value}</option>)}</SelectField>
            <InputField id="admin-property-area" errorId="admin-property-area-error" label="Superficie total (m²)" type="number" min="0.01" step="0.01" value={draft.totalArea} required onChange={(event) => setDraft({ ...draft, totalArea: event.target.value })} />
            <InputField id="admin-property-rooms" errorId="admin-property-rooms-error" label="Ambientes" type="number" min="1" step="1" value={draft.rooms} required onChange={(event) => setDraft({ ...draft, rooms: event.target.value })} />
            {([ ["bedrooms", "Dormitorios"], ["bathrooms", "Baños"], ["garage", "Cocheras"], ["age", "Antigüedad (años)"] ] as const).map(([field, label]) => <InputField key={field} id={`admin-property-${field}`} errorId={`admin-property-${field}-error`} label={label} type="number" min="0" step="1" value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />)}
            <SelectField id="admin-property-condition" label="Estado del inmueble" value={draft.propertyCondition} onChange={(value) => setDraft({ ...draft, propertyCondition: value as PropertyCondition | "" })} disabled={isSaving}><option value="">Sin especificar</option>{Object.entries(PROPERTY_CONDITIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectField>
            <SelectField id="admin-property-pets" label="¿Acepta mascotas?" value={draft.acceptsPets} onChange={(value) => setDraft({ ...draft, acceptsPets: value as PropertyDraft["acceptsPets"] })} disabled={isSaving}><option value="">Sin especificar</option><option value="yes">Sí</option><option value="no">No</option></SelectField>
            {([ ["expenses", `Expensas (${draft.currency})`], ["taxes", `Impuestos (${draft.currency})`], ["commissions", `Comisiones (${draft.currency})`] ] as const).map(([field, label]) => <InputField key={field} id={`admin-property-${field}`} errorId={`admin-property-${field}-error`} label={label} type="number" min="0" step="0.01" value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} />)}
            <InputField id="admin-property-latitude" errorId="admin-property-latitude-error" label="Latitud" type="number" min="-90" max="90" step="any" value={draft.latitude} onChange={(event) => setDraft({ ...draft, latitude: event.target.value })} />
            <InputField id="admin-property-longitude" errorId="admin-property-longitude-error" label="Longitud" type="number" min="-180" max="180" step="any" value={draft.longitude} onChange={(event) => setDraft({ ...draft, longitude: event.target.value })} />
          </div>
          <fieldset><legend className="mb-3 text-sm font-medium">Servicios disponibles</legend><div className="flex flex-wrap gap-4">{Object.entries(PROPERTY_SERVICES).map(([code, label]) => <Label key={code} className="cursor-pointer"><input type="checkbox" checked={draft.serviceCodes.includes(code as PropertyService)} onChange={(event) => setDraft({ ...draft, serviceCodes: event.target.checked ? [...draft.serviceCodes, code as PropertyService] : draft.serviceCodes.filter((item) => item !== code) })} />{label}</Label>)}</div></fieldset>
          <fieldset><legend className="mb-3 text-sm font-medium">Comodidades</legend><div className="flex flex-wrap gap-4">{Object.entries(PROPERTY_AMENITIES).map(([code, label]) => <Label key={code} className="cursor-pointer"><input type="checkbox" checked={draft.amenityCodes.includes(code as PropertyAmenity)} onChange={(event) => setDraft({ ...draft, amenityCodes: event.target.checked ? [...draft.amenityCodes, code as PropertyAmenity] : draft.amenityCodes.filter((item) => item !== code) })} />{label}</Label>)}</div></fieldset>
          </fieldset>
          {editorError && <p role="alert" className="text-sm text-destructive">{editorError}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={isSaving}>Cancelar</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar cambios"}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>

    <PropertyChangeHistoryDialog propertyId={history?.id ?? ""} open={Boolean(history)} onOpenChange={(open) => { if (!open) setHistory(null); }} loadHistory={adminService.propertyHistory} />
    <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => { if (!open && !changing) setPendingAction(null); }}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{actionCopy[0]}</AlertDialogTitle><AlertDialogDescription>{actionCopy[1]}</AlertDialogDescription></AlertDialogHeader>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<AlertDialogFooter><AlertDialogCancel disabled={changing}>Cancelar</AlertDialogCancel><AlertDialogAction className={pendingAction?.action === "delete" ? "bg-destructive text-white hover:bg-destructive/90" : undefined} onClick={(event) => { event.preventDefault(); void confirmAction(); }} disabled={changing}>{changing ? "Procesando..." : actionCopy[2]}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </section>;
}
