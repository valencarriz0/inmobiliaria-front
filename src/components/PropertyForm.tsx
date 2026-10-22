import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from "react";
import { CURRENCIES, OPERATION_TYPES, PROPERTY_AMENITIES, PROPERTY_CONDITIONS, PROPERTY_SERVICES, PROPERTY_TYPES } from "../constants/property";
import { useFormValidation } from "../hooks/use-form-validation";
import { invalidateConfirmedCoordinates } from "../lib/geocoding";
import { createPropertyFormValues, toPropertyInput } from "../lib/property-form";
import { isOptionKey, validatePropertyForm } from "../lib/validation";
import { getCities, getProvinces } from "../services/locationService";
import type { City, Province } from "../types/location";
import type { Property } from "../types/property";
import type { EditablePropertyData } from "../types/property-input";
import type { PropertyFormSubmission, PropertyFormValues } from "../types/property-form";
import GuidedFormSteps from "./GuidedFormSteps";
import LocationPicker from "./LocationPicker";
import LocationOptionCombobox from "./LocationOptionCombobox";
import PropertyImages from "./PropertyImages";
import { Button } from "./ui/button";
import { FieldError } from "./ui/field-error";
import { InputField } from "./ui/input-field";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Skeleton, SkeletonStatus } from "./ui/skeleton";

interface PropertyFormProps {
  initialProperty?: EditablePropertyData & Pick<Property, "images">;
  submitLabel: string;
  onSubmit: (input: PropertyFormSubmission) => Promise<void>;
  onCancel: () => void;
}

function optionList<T extends Record<string, string>>(options: T) {
  return Object.keys(options).filter((key): key is Extract<keyof T, string> => isOptionKey(options, key)).map((value) => ({ value, label: options[value] }));
}

type TextField = { [K in keyof PropertyFormValues]: string extends PropertyFormValues[K] ? K : never }[keyof PropertyFormValues];

const steps = [
  { title: "Datos básicos", description: "Tipo y precio" },
  { title: "Ubicación", description: "Dirección y mapa" },
  { title: "Características", description: "Superficie y ambientes" },
  { title: "Detalles y fotos", description: "Descripción e imágenes" },
  { title: "Revisión", description: "Confirmá los datos" },
] as const;

export default function PropertyForm({ initialProperty, submitLabel, onSubmit, onCancel }: PropertyFormProps) {
  const [values, setValues] = useState(() => createPropertyFormValues(initialProperty));
  const [step, setStep] = useState(0);
  const [imageSelectionError, setImageSelectionError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locationsError, setLocationsError] = useState<string>();
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const submitting = useRef(false);
  const { errors, fieldProps, errorId, validateForm, touch } = useFormValidation(() => {
    const validation = validatePropertyForm(values);
    return { ...validation, images: imageSelectionError ?? validation.images };
  });

  useEffect(() => {
    const controller = new AbortController();
    getProvinces(controller.signal).then(({ provinces: result }) => setProvinces(result))
      .catch(() => { if (!controller.signal.aborted) setLocationsError("No se pudieron cargar las provincias."); })
      .finally(() => { if (!controller.signal.aborted) setLoadingLocations(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!values.provinceId) { setCities([]); setLoadingCities(false); return; }
    const controller = new AbortController();
    setCities([]);
    setLoadingCities(true);
    getCities(values.provinceId, controller.signal)
      .then(({ cities: result }) => setCities(result))
      .catch(() => { if (!controller.signal.aborted) setLocationsError("No se pudieron cargar las localidades."); })
      .finally(() => { if (!controller.signal.aborted) setLoadingCities(false); });
    return () => controller.abort();
  }, [values.provinceId]);

  function updateField<K extends keyof PropertyFormValues>(field: K, value: PropertyFormValues[K]) {
    setValues((previous) => field === "street" || field === "number"
      ? invalidateConfirmedCoordinates({ ...previous, [field]: value })
      : { ...previous, [field]: value });
  }

  function inputField(field: TextField, label: string, required = false, inputMode?: ComponentProps<"input">["inputMode"], placeholder?: string, disabled = false) {
    return <InputField {...fieldProps(field)} label={label} required={required} aria-required={required} disabled={disabled}
      value={values[field]} onChange={(event) => updateField(field, event.target.value)} inputMode={inputMode}
      placeholder={placeholder ?? (disabled ? "No aplica para terrenos" : undefined)} error={errors[field]} errorId={errorId(field)}
      className="h-11 rounded-xl border-border shadow-none" />;
  }

  function selectField<T extends string>(field: keyof PropertyFormValues, label: string, value: T | "", options: readonly { value: T; label: string }[], onChange: (value: T | "") => void, required = false, disabled = false) {
    return <div className="space-y-2">
      <Label htmlFor={fieldProps(field).id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Select value={value || (required ? "" : "unspecified")} onValueChange={(selected) => {
        const option = options.find((item) => item.value === selected);
        if (!required && selected === "unspecified") onChange("");
        else if (option) onChange(option.value);
        touch(field);
      }} disabled={disabled}>
        <SelectTrigger {...fieldProps(field)} aria-required={required} className="w-full data-[size=default]:h-11"><SelectValue placeholder="Seleccioná una opción" /></SelectTrigger>
        <SelectContent>{!required && <SelectItem value="unspecified">No especificado</SelectItem>}{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
      <FieldError id={errorId(field)}>{errors[field]}</FieldError>
    </div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    if (step < steps.length - 1) {
      const stepFields = [
        ["title", "propertyType", "operationType", "price", "currency"],
        ["province", "city", "number"],
        ["totalArea", "rooms", "bedrooms", "bathrooms", "garage", "age", "propertyCondition", "acceptsPets", "expenses", "taxes", "commissions"],
        ["description", "services", "amenities", "images"],
      ][step] ?? [];
      const currentErrors = validatePropertyForm(values);
      const firstInvalid = stepFields.find((field) => currentErrors[field as keyof PropertyFormValues]);
      if (firstInvalid) {
        stepFields.forEach((field) => touch(field));
        const form = event.currentTarget;
        const fieldName = firstInvalid === "province" ? "provinceId" : firstInvalid === "city" ? "cityId" : firstInvalid;
        requestAnimationFrame(() => form.querySelector<HTMLElement>(`[name="${fieldName}"]`)?.focus());
        return;
      }
      setStep((current) => Math.min(current + 1, steps.length - 1));
      return;
    }
    if (!validateForm(event.currentTarget)) return;
    const input = toPropertyInput(values);
    if (!input) return;
    submitting.current = true;
    setSaving(true);
    setSubmitError(undefined);
    try { await onSubmit(input); }
    catch (error) { setSubmitError(error instanceof Error ? error.message : "No se pudo guardar la propiedad. Intentá nuevamente."); }
    finally { submitting.current = false; setSaving(false); }
  };

  return <form noValidate onSubmit={handleSubmit} className="space-y-6" aria-busy={saving}>
    <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:gap-7">
      <GuidedFormSteps steps={steps} activeStep={step} onSelect={setStep} />
      <div className="min-w-0 rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-6">
      <FieldError>{submitError}</FieldError>
      <fieldset disabled={saving} className="space-y-6 min-w-0">
      {step === 0 && <section className="space-y-5" aria-labelledby="property-basic-title">
        <div><h2 id="property-basic-title" className="text-xl font-semibold">Empecemos por lo principal</h2><p className="mt-1 text-sm text-muted-foreground">Contanos qué ofrecés y cuál es su valor.</p></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{inputField("title", "Título de la publicación", true, undefined, "Ejemplo: Casa familiar con jardín")}</div>
          {selectField("propertyType", "Tipo de inmueble", values.propertyType, optionList(PROPERTY_TYPES), (value) => {
            if (value === "land") setValues((previous) => ({ ...previous, propertyType: value, rooms: "", bedrooms: "", bathrooms: "", garage: "", age: "", propertyCondition: "", acceptsPets: "" }));
            else updateField("propertyType", value);
          }, true)}
          {selectField("operationType", "Categoría", values.operationType, optionList(OPERATION_TYPES), (value) => updateField("operationType", value), true)}
          {inputField("price", "Precio", true, "decimal", "Ejemplo: 150000")}
          {selectField("currency", "Moneda", values.currency, CURRENCIES.map((value) => ({ value, label: value })), (value) => updateField("currency", value), true)}
        </div>
      </section>}

      {step === 1 && <section className="space-y-5" aria-labelledby="property-location-title">
        <div><h2 id="property-location-title" className="text-xl font-semibold">¿Dónde está ubicada?</h2><p className="mt-1 text-sm text-muted-foreground">Completá la dirección y buscá el punto en el mapa a continuación.</p></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loadingLocations ? <SkeletonStatus label="Cargando provincias..." className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full" /></SkeletonStatus> : <LocationOptionCombobox id={fieldProps("provinceId").id} name="provinceId" label="Provincia" placeholder="Escribí para buscar una provincia"
            inputProps={fieldProps("provinceId")} options={provinces} value={values.province ? { id: values.provinceId, name: values.province } : undefined}
            error={errors.province || locationsError} disabled={loadingLocations}
            onBlur={() => touch("province")}
            onChange={(province) => setValues((previous) => invalidateConfirmedCoordinates({ ...previous, provinceId: province?.id ?? "", province: province?.name ?? "", cityId: "", city: "" }))} />}
          {loadingCities ? <SkeletonStatus label="Cargando localidades..." className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full" /></SkeletonStatus> : <LocationOptionCombobox id={fieldProps("cityId").id} name="cityId" label="Localidad" placeholder={values.provinceId ? "Escribí para buscar una localidad" : "Primero elegí una provincia"}
            inputProps={fieldProps("cityId")} options={cities} value={values.city ? { id: values.cityId, name: values.city } : undefined}
            error={errors.city} disabled={!values.provinceId}
            onBlur={() => touch("city")}
            onChange={(city) => setValues((previous) => invalidateConfirmedCoordinates({ ...previous, cityId: city?.id ?? "", city: city?.name ?? "" }))} />}
          {inputField("street", "Calle", false, undefined, "Ejemplo: Av. Libertador")}
          {inputField("number", "Altura", false, "numeric", "Ejemplo: 1234")}
        </div>
        <LocationPicker cityId={values.cityId} street={values.street} streetNumber={values.number} confirmed={values.locationConfirmed}
          onConfirm={(coordinates) => setValues((previous) => ({ ...previous, ...coordinates, locationConfirmed: true }))} />
      </section>}

      {step === 2 && <section className="space-y-5" aria-labelledby="property-features-title">
        <div><h2 id="property-features-title" className="text-xl font-semibold">Características del inmueble</h2><p className="mt-1 text-sm text-muted-foreground">Completá los datos que ayudan a describir mejor la propiedad.</p></div>
        {values.propertyType === "land" && <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">Los datos de ambientes, dormitorios, baños, cocheras y antigüedad no aplican a los terrenos.</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {inputField("totalArea", "Superficie total en m²", true, "decimal", "Ejemplo: 100")}
          {inputField("rooms", "Cantidad de ambientes", true, "numeric", undefined, values.propertyType === "land")}
          {inputField("bedrooms", "Cantidad de dormitorios", false, "numeric", undefined, values.propertyType === "land")}
          {inputField("bathrooms", "Cantidad de baños", false, "numeric", undefined, values.propertyType === "land")}
          {inputField("garage", "Cantidad de cocheras", false, "numeric", undefined, values.propertyType === "land")}
          {inputField("age", "Antigüedad en años", false, "numeric", undefined, values.propertyType === "land")}
          {selectField("propertyCondition", "Estado del inmueble", values.propertyCondition, optionList(PROPERTY_CONDITIONS), (value) => updateField("propertyCondition", value), false, values.propertyType === "land")}
          {selectField("acceptsPets", "¿Acepta mascotas?", values.acceptsPets, [{ value: "yes", label: "Sí" }, { value: "no", label: "No" }], (value) => updateField("acceptsPets", value), false, values.propertyType === "land")}
          {inputField("expenses", `Expensas${values.currency ? ` (${values.currency})` : ""}`, false, "decimal")}
          {inputField("taxes", `Impuestos${values.currency ? ` (${values.currency})` : ""}`, false, "decimal")}
          {inputField("commissions", `Comisiones${values.currency ? ` (${values.currency})` : ""} — importe`, false, "decimal")}
        </div>
      </section>}

      {step === 3 && <section className="space-y-6" aria-labelledby="property-details-title">
        <div><h2 id="property-details-title" className="text-xl font-semibold">Detalles y fotos</h2><p className="mt-1 text-sm text-muted-foreground">Completá la descripción, los servicios y las imágenes.</p></div>
        <fieldset><legend className="mb-3 text-sm font-medium">Servicios disponibles</legend><div className="flex flex-wrap gap-6">
          {optionList(PROPERTY_SERVICES).map(({ value, label }, index) => <Label key={value} className="flex cursor-pointer items-center gap-2"><input {...fieldProps("services")} id={`${fieldProps("services").id}-${index}`} type="checkbox" value={value} checked={values.services.includes(value)} onChange={(event) => updateField("services", event.target.checked ? [...values.services, value] : values.services.filter((service) => service !== value))} className="size-4" /><span className="text-sm">{label}</span></Label>)}
        </div><FieldError id={errorId("services")}>{errors.services}</FieldError></fieldset>
        <fieldset><legend className="mb-3 text-sm font-medium">Comodidades</legend><div className="flex flex-wrap gap-6">
          {optionList(PROPERTY_AMENITIES).map(({ value, label }, index) => <Label key={value} className="flex cursor-pointer items-center gap-2"><input {...fieldProps("amenities")} id={`${fieldProps("amenities").id}-${index}`} type="checkbox" value={value} checked={values.amenities.includes(value)} onChange={(event) => updateField("amenities", event.target.checked ? [...values.amenities, value] : values.amenities.filter((amenity) => amenity !== value))} className="size-4" /><span className="text-sm">{label}</span></Label>)}
        </div><FieldError id={errorId("amenities")}>{errors.amenities}</FieldError></fieldset>
        <div><Label htmlFor={fieldProps("description").id} className="mb-1 block text-sm font-medium">Descripción <span className="text-destructive">*</span></Label><Textarea {...fieldProps("description")} required aria-required placeholder="Ejemplo: Hermosa casa ubicada en una zona tranquila..." rows={5} value={values.description} onChange={(event) => updateField("description", event.target.value)} className="rounded-xl border-border bg-background shadow-none" /><FieldError id={errorId("description")}>{errors.description}</FieldError></div>
        <PropertyImages images={values.images} onChange={(images) => { updateField("images", images); setImageSelectionError(undefined); touch("images"); }} onSelectionError={(error) => { setImageSelectionError(error); touch("images"); }} fieldProps={fieldProps("images")} error={errors.images} errorId={errorId("images")} />
      </section>}

      {step === 4 && <section className="space-y-5" aria-labelledby="property-review-title">
        <div><h2 id="property-review-title" className="text-xl font-semibold">Revisá antes de publicar</h2><p className="mt-1 text-sm text-muted-foreground">Podés volver a los pasos anteriores para cambiar cualquier dato.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[["Publicación", values.title, `${PROPERTY_TYPES[values.propertyType as keyof typeof PROPERTY_TYPES] ?? "Tipo pendiente"} · ${OPERATION_TYPES[values.operationType as keyof typeof OPERATION_TYPES] ?? "Categoría pendiente"}`], ["Precio", `${values.currency} ${values.price}`, ""], ["Ubicación", [values.street, values.number, values.city, values.province].filter(Boolean).join(" ") || "Sin ubicación", values.locationConfirmed ? "Ubicación confirmada en el mapa" : "Sin punto confirmado"], ["Características", `${values.totalArea || "—"} m²${values.propertyType === "land" ? " · Terreno" : values.rooms ? ` · ${values.rooms} ambientes` : ""}`, ""], ["Imágenes", `${values.images.length} seleccionadas`, ""]].map(([label, value, detail]) => <div key={label} className="rounded-xl border border-border bg-muted/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value || "Sin completar"}</p>{detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}</div>)}
        </div>
      </section>}

      <div className="mt-6 flex justify-center gap-4">
        {step === 0 ? <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button> : <Button variant="outline" type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))}>Paso anterior</Button>}
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : step < steps.length - 1 ? "Continuar" : submitLabel}</Button>
      </div>
      </fieldset>
      </div>
    </div>
  </form>;
}
