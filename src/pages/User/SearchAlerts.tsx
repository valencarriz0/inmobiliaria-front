import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bell, MoreVertical, Pause, Pencil, Play, Search, Trash2 } from "lucide-react";
import PropertyLocationCombobox from "../../components/PropertyLocationCombobox";
import { CardListSkeleton } from "../../components/LoadingSkeletons";
import { Button } from "../../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { FieldError } from "../../components/ui/field-error";
import { InputField } from "../../components/ui/input-field";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { searchAlertService } from "../../services/searchAlertService";
import { createPropertySearchValues, serializePropertySearchFilters, toPropertySearchFilters, validatePropertySearch } from "../../lib/property-search";
import { OPERATION_TYPES, PROPERTY_TYPES } from "../../constants/property";
import type { SearchAlert, SearchAlertInput } from "../../types/search-alert";
import type { PropertySearchFilters, PropertySearchValues } from "../../types/property-search";

const priceFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

function alertSearchPath(alert: SearchAlert) {
  const filters: PropertySearchFilters = {
    operationType: alert.operationType ?? undefined,
    propertyType: alert.propertyType ?? undefined,
    provinceId: alert.provinceId ?? undefined,
    cityId: alert.cityId ?? undefined,
    currency: alert.currency ?? undefined,
    minPrice: alert.minPrice ?? undefined,
    maxPrice: alert.maxPrice ?? undefined,
  };
  const query = serializePropertySearchFilters(filters).toString();
  return query ? `/?${query}` : "/";
}

function alertPriceLabel(alert: SearchAlert) {
  if (alert.minPrice == null && alert.maxPrice == null) return null;
  const currency = alert.currency ?? "ARS";
  if (alert.minPrice != null && alert.maxPrice != null) return `${currency} ${priceFormatter.format(alert.minPrice)} – ${priceFormatter.format(alert.maxPrice)}`;
  if (alert.minPrice != null) return `Desde ${currency} ${priceFormatter.format(alert.minPrice)}`;
  if (alert.maxPrice != null) return `Hasta ${currency} ${priceFormatter.format(alert.maxPrice)}`;
  return null;
}

function fromAlert(alert: SearchAlert): PropertySearchValues { return createPropertySearchValues({ operationType: alert.operationType ?? undefined, propertyType: alert.propertyType ?? undefined, provinceId: alert.provinceId ?? undefined, cityId: alert.cityId ?? undefined, province: alert.province?.name, city: alert.city?.name, currency: alert.currency ?? undefined, minPrice: alert.minPrice ?? undefined, maxPrice: alert.maxPrice ?? undefined }); }
function toInput(values: PropertySearchValues, name: string): SearchAlertInput | undefined { const filters = toPropertySearchFilters(values); return filters ? { name: name.trim() || null, operationType: filters.operationType ?? null, propertyType: filters.propertyType ?? null, provinceId: filters.provinceId ?? null, cityId: filters.cityId ?? null, currency: filters.currency ?? null, minPrice: filters.minPrice ?? null, maxPrice: filters.maxPrice ?? null } : undefined; }
function Editor({ alert, close, saved }: { alert: SearchAlert | null; close: () => void; saved: (alert: SearchAlert) => void }) {
  const [values, setValues] = useState(() => alert ? fromAlert(alert) : createPropertySearchValues());
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validatePropertySearch(values) : {};
  const selectClassName = "h-12 w-full rounded-xl border-border bg-background px-3.5 text-sm font-normal text-foreground shadow-none data-[size=default]:h-12";

  useEffect(() => {
    if (!alert) return;
    setValues(fromAlert(alert));
    setName(alert.name ?? "");
    setError("");
    setSubmitted(false);
  }, [alert]);

  const updateValues = (next: Partial<PropertySearchValues>) => setValues((previous) => ({ ...previous, ...next }));

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!alert || saving) return;
    setSubmitted(true);
    const input = toInput(values, name);
    if (!input) return;
    setSaving(true);
    setError("");
    try {
      saved((await searchAlertService.update(alert.id, input)).alert);
      close();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar la alerta.");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open={Boolean(alert)} onOpenChange={(open) => { if (!open && !saving) close(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border-border p-5 sm:max-w-2xl sm:p-7">
      <DialogHeader className="pr-8 text-left">
        <DialogTitle className="font-[family-name:var(--font-grotesk)] text-xl leading-tight">Editar alerta</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed">Definí los criterios de las propiedades que querés recibir.</DialogDescription>
      </DialogHeader>
      <form className="space-y-5" onSubmit={save}>
        <InputField id="alert-name" label="Nombre" errorId="alert-name-error" value={name}
          className="h-12 rounded-xl border-border px-3.5 text-sm shadow-none" onChange={(event) => setName(event.target.value)} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="alert-operation-type">Categoría</Label>
            <Select value={values.operationType || "all"} onValueChange={(value) => updateValues({ operationType: value === "all" ? "" : value })}>
              <SelectTrigger id="alert-operation-type" aria-invalid={Boolean(errors.operationType)} aria-describedby={errors.operationType ? "alert-operation-error" : undefined} className={selectClassName}><SelectValue placeholder="Cualquiera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                {Object.entries(OPERATION_TYPES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError id="alert-operation-error">{errors.operationType}</FieldError>
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="alert-property-type">Tipo de inmueble</Label>
            <Select value={values.propertyType || "all"} onValueChange={(value) => updateValues({ propertyType: value === "all" ? "" : value })}>
              <SelectTrigger id="alert-property-type" aria-invalid={Boolean(errors.propertyType)} aria-describedby={errors.propertyType ? "alert-property-error" : undefined} className={selectClassName}><SelectValue placeholder="Cualquiera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                {Object.entries(PROPERTY_TYPES).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <FieldError id="alert-property-error">{errors.propertyType}</FieldError>
          </div>
        </div>
        <PropertyLocationCombobox showLabel portal value={values} onChange={updateValues} onBlur={() => undefined} error={errors.provinceId || errors.cityId} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="alert-currency">Moneda</Label>
            <Select value={values.currency || "all"} onValueChange={(value) => updateValues({ currency: value === "all" ? "" : value })}>
              <SelectTrigger id="alert-currency" aria-invalid={Boolean(errors.currency)} aria-describedby={errors.currency ? "alert-currency-error" : undefined} className={selectClassName}><SelectValue placeholder="Cualquiera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Cualquiera</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
            <FieldError id="alert-currency-error">{errors.currency}</FieldError>
          </div>
          <InputField id="alert-min" label="Precio mínimo" errorId="alert-min-error" inputMode="decimal" placeholder="Sin mínimo" value={values.minPrice}
            className="h-12 rounded-xl border-border px-3.5 text-sm shadow-none" onChange={(event) => updateValues({ minPrice: event.target.value })} error={errors.minPrice} />
          <InputField id="alert-max" label="Precio máximo" errorId="alert-max-error" inputMode="decimal" placeholder="Sin máximo" value={values.maxPrice}
            className="h-12 rounded-xl border-border px-3.5 text-sm shadow-none" onChange={(event) => updateValues({ maxPrice: event.target.value })} error={errors.maxPrice} />
        </div>
        <FieldError>{error}</FieldError>
        <DialogFooter className="border-t border-border pt-5">
          <Button type="button" variant="outline" disabled={saving} className="h-11 rounded-xl border-border px-5 shadow-none" onClick={close}>Cancelar</Button>
          <Button disabled={saving} className="h-11 rounded-xl bg-primary px-5 text-primary-foreground hover:bg-primary/90">{saving ? "Guardando..." : "Guardar cambios"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
export default function SearchAlerts() {
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [editing, setEditing] = useState<SearchAlert | null>(null);
  const [deleting, setDeleting] = useState<SearchAlert | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ message: string; isError: boolean } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void searchAlertService.list()
      .then((result) => { if (active) setAlerts(result.alerts); })
      .catch(() => { if (active) setError("No se pudieron cargar tus alertas."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  const toggleActive = async (alert: SearchAlert) => {
    if (updatingId) return;
    setUpdatingId(alert.id);
    setNotice(null);
    try {
      const result = alert.isActive
        ? await searchAlertService.deactivate(alert.id)
        : await searchAlertService.activate(alert.id);
      setAlerts((items) => items.map((item) => item.id === alert.id ? result.alert : item));
      setNotice({ message: alert.isActive ? "Alerta pausada correctamente." : "Alerta reactivada correctamente.", isError: false });
    } catch {
      setNotice({ message: "No se pudo cambiar el estado de la alerta. Intentá nuevamente.", isError: true });
    } finally {
      setUpdatingId(null);
    }
  };

  const removeAlert = async () => {
    if (!deleting || deletingInProgress) return;
    setDeletingInProgress(true);
    setDeleteError("");
    try {
      await searchAlertService.remove(deleting.id);
      setAlerts((items) => items.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      setNotice({ message: "Alerta eliminada correctamente.", isError: false });
    } catch {
      setDeleteError("No se pudo eliminar la alerta. Intentá nuevamente.");
    } finally {
      setDeletingInProgress(false);
    }
  };

  return <>
    <article className="publisher-panel">
      <div className="publisher-panel-heading">
        <div>
          <h1>Mis alertas</h1>
          <p>Administrá los criterios de las propiedades que querés recibir</p>
        </div>
      </div>
      {notice && <p role={notice.isError ? "alert" : "status"} className="mb-4 text-sm text-foreground">{notice.message}</p>}
      {loading ? <CardListSkeleton label="Cargando alertas..." variant="alerts" count={2} /> : error ? (
        <div className="publisher-empty-state publisher-consultation-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
        </div>
      ) : alerts.length ? (
        <div className="grid content-start gap-4">
          {alerts.map((alert) => {
            const price = alertPriceLabel(alert);
            const criteriaParts = [
              alert.operationType && OPERATION_TYPES[alert.operationType],
              alert.propertyType && PROPERTY_TYPES[alert.propertyType],
              alert.city?.name ?? alert.province?.name,
              !price && alert.currency,
            ];
            const criteria = criteriaParts.filter(Boolean).join(" · ") || "Todas las propiedades";
            return <article key={alert.id} className="rounded-2xl border border-border bg-background p-5 shadow-[0_3px_14px_rgba(23,23,23,0.04)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground"><Bell size={20} aria-hidden="true" /></span>
                  <div className="min-w-0">
                    <h2 className="break-words font-[family-name:var(--font-grotesk)] text-lg font-semibold text-foreground">{alert.name || "Alerta de búsqueda"}</h2>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{criteria}</p>
                    {price && <p className="mt-3 text-sm font-medium text-foreground">{price}</p>}
                  </div>
                </div>
                <span className={`publisher-status ${alert.isActive ? "is-active" : "is-paused"}`}>{alert.isActive ? "Activa" : "Pausada"}</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button asChild className="rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <Link to={alertSearchPath(alert)}><Search className="size-4" aria-hidden="true" /> Ver coincidencias</Link>
                </Button>
                <div className="ml-auto flex items-center gap-1">
                  <Button type="button" variant="ghost" className="text-sm font-medium text-foreground" onClick={() => setEditing(alert)}><Pencil className="size-4" aria-hidden="true" /> Editar</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" aria-label={`Más acciones para ${alert.name || "Alerta de búsqueda"}`} disabled={Boolean(updatingId)}><MoreVertical className="size-4" aria-hidden="true" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => void toggleActive(alert)}>
                        {alert.isActive ? <><Pause aria-hidden="true" /> Pausar alerta</> : <><Play aria-hidden="true" /> Reactivar</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => { setDeleting(alert); setDeleteError(""); }}><Trash2 aria-hidden="true" /> Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </article>;
          })}
        </div>
      ) : (
        <div className="publisher-empty-state user-consultations-empty">
          <Bell size={24} aria-hidden="true" />
          <h2>Todavía no creaste alertas</h2>
          <p>Buscá propiedades en el catálogo y guardá una alerta para recibir novedades.</p>
          <Link className="user-consultations-primary-action" to="/">Explorar propiedades</Link>
        </div>
      )}
    </article>
    <Editor
      alert={editing}
      close={() => setEditing(null)}
      saved={(updated) => {
        setAlerts((items) => items.map((item) => item.id === updated.id ? updated : item));
        setNotice({ message: "Alerta actualizada correctamente.", isError: false });
      }}
    />
    <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !deletingInProgress) setDeleting(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta alerta?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará {deleting?.name ? `“${deleting.name}”` : "esta alerta"} y las notificaciones asociadas. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletingInProgress}>Cancelar</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deletingInProgress} onClick={(event) => { event.preventDefault(); void removeAlert(); }}>
            {deletingInProgress ? "Eliminando..." : "Eliminar alerta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}
