import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import PropertyLocationCombobox from "../../components/PropertyLocationCombobox";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { FieldError } from "../../components/ui/field-error";
import { InputField } from "../../components/ui/input-field";
import { searchAlertService } from "../../services/searchAlertService";
import { createPropertySearchValues, toPropertySearchFilters, validatePropertySearch } from "../../lib/property-search";
import { OPERATION_TYPES, PROPERTY_TYPES } from "../../constants/property";
import type { SearchAlert, SearchAlertInput } from "../../types/search-alert";
import type { PropertySearchValues } from "../../types/property-search";

function fromAlert(alert: SearchAlert): PropertySearchValues { return createPropertySearchValues({ operationType: alert.operationType ?? undefined, propertyType: alert.propertyType ?? undefined, provinceId: alert.provinceId ?? undefined, cityId: alert.cityId ?? undefined, province: alert.province?.name, city: alert.city?.name, currency: alert.currency ?? undefined, minPrice: alert.minPrice ?? undefined, maxPrice: alert.maxPrice ?? undefined }); }
function toInput(values: PropertySearchValues, name: string): SearchAlertInput | undefined { const filters = toPropertySearchFilters(values); return filters ? { name: name.trim() || null, operationType: filters.operationType ?? null, propertyType: filters.propertyType ?? null, provinceId: filters.provinceId ?? null, cityId: filters.cityId ?? null, currency: filters.currency ?? null, minPrice: filters.minPrice ?? null, maxPrice: filters.maxPrice ?? null } : undefined; }
function Editor({ alert, close, saved }: { alert: SearchAlert | null; close: () => void; saved: (alert: SearchAlert) => void }) { const [values, setValues] = useState(() => alert ? fromAlert(alert) : createPropertySearchValues()); const [name, setName] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [submitted, setSubmitted] = useState(false); useEffect(() => { if (alert) { setValues(fromAlert(alert)); setName(alert.name ?? ""); setError(""); setSubmitted(false); } }, [alert]); const errors = submitted ? validatePropertySearch(values) : {}; const save = async (event: FormEvent) => { event.preventDefault(); if (!alert || saving) return; setSubmitted(true); const input = toInput(values, name); if (!input) return; setSaving(true); setError(""); try { saved((await searchAlertService.update(alert.id, input)).alert); close(); } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar la alerta."); } finally { setSaving(false); } }; return <Dialog open={Boolean(alert)} onOpenChange={(open) => { if (!open && !saving) close(); }}><DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>Editar alerta</DialogTitle><DialogDescription>Definí los criterios de las propiedades que querés recibir.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={save}><InputField id="alert-name" label="Nombre" errorId="alert-name-error" value={name} onChange={(event) => setName(event.target.value)}/><div className="grid grid-cols-2 gap-3"><label>Categoría<select className="mt-1 h-10 w-full rounded-md border px-2" value={values.operationType} onChange={(event) => setValues({ ...values, operationType: event.target.value })}><option value="">Cualquiera</option><option value="sale">Venta</option><option value="rent">Alquiler</option><option value="temporary_rent">Alquiler temporario</option></select></label><label>Tipo<select className="mt-1 h-10 w-full rounded-md border px-2" value={values.propertyType} onChange={(event) => setValues({ ...values, propertyType: event.target.value })}><option value="">Cualquiera</option><option value="house">Casa</option><option value="apartment">Departamento</option><option value="commercial">Local comercial</option></select></label></div><PropertyLocationCombobox value={values} onChange={(location) => setValues({ ...values, ...location })} onBlur={() => undefined} error={errors.provinceId || errors.cityId}/><div className="grid grid-cols-3 gap-3"><label>Moneda<select className="mt-1 h-10 w-full rounded-md border px-2" value={values.currency} onChange={(event) => setValues({ ...values, currency: event.target.value })}><option value="">Cualquiera</option><option value="ARS">ARS</option><option value="USD">USD</option></select><FieldError>{errors.currency}</FieldError></label><InputField id="alert-min" label="Precio mínimo" errorId="alert-min-error" value={values.minPrice} onChange={(event) => setValues({ ...values, minPrice: event.target.value })} error={errors.minPrice}/><InputField id="alert-max" label="Precio máximo" errorId="alert-max-error" value={values.maxPrice} onChange={(event) => setValues({ ...values, maxPrice: event.target.value })} error={errors.maxPrice}/></div><FieldError>{error}</FieldError><DialogFooter><Button type="button" variant="outline" disabled={saving} onClick={close}>Cancelar</Button><Button disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button></DialogFooter></form></DialogContent></Dialog>; }
export default function SearchAlerts() {
  const [alerts, setAlerts] = useState<SearchAlert[]>([]);
  const [editing, setEditing] = useState<SearchAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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

  return <>
    <article className="publisher-panel">
      <div className="publisher-panel-heading">
        <div>
          <h1>Mis alertas</h1>
          <p>Administrá los criterios de las propiedades que querés recibir</p>
        </div>
      </div>
      {notice && <p role="status" className="mb-4 text-sm">{notice}</p>}
      {loading ? <p className="publisher-empty-state" role="status">Cargando alertas...</p> : error ? (
        <div className="publisher-empty-state publisher-consultation-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>Reintentar</button>
        </div>
      ) : alerts.length ? (
        <div className="grid content-start gap-3">
          {alerts.map((alert) => (
            <article key={alert.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent"><Bell size={18} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-sm font-semibold">{alert.name || "Alerta de búsqueda"}</h2>
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  {[alert.operationType && OPERATION_TYPES[alert.operationType], alert.propertyType && PROPERTY_TYPES[alert.propertyType], alert.city?.name ?? alert.province?.name, alert.currency].filter(Boolean).join(" · ") || "Todas las propiedades"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditing(alert)}>Editar</Button>
            </article>
          ))}
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
        setNotice("Alerta actualizada correctamente.");
      }}
    />
  </>;
}
