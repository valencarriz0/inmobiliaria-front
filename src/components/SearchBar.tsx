import { useState, type FormEvent } from "react";
import { BellPlus, Check, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { OPERATION_TYPES, PROPERTY_TYPES } from "../constants/property";
import { useFormValidation } from "../hooks/use-form-validation";
import {
  createPropertySearchValues, toPropertySearchFilters, validatePropertySearch,
} from "../lib/property-search";
import type { PropertySearchFilters, PropertySearchValues } from "../types/property-search";
import { FieldError } from "./ui/field-error";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import PropertyLocationCombobox from "./PropertyLocationCombobox";
import PropertyPriceFilter from "./PropertyPriceFilter";

interface SearchBarProps {
  initialValues: PropertySearchValues;
  onSearch: (filters: PropertySearchFilters) => void;
  onClear: () => void;
  onCreateAlert?: (filters: PropertySearchFilters) => Promise<void>;
}

export default function SearchBar({ initialValues, onSearch, onClear, onCreateAlert }: SearchBarProps) {
  const [values, setValues] = useState(initialValues);
  const [alertStatus, setAlertStatus] = useState<"created" | "error" | null>(null);
  const [creatingAlert, setCreatingAlert] = useState(false);
  const validation = useFormValidation(() => validatePropertySearch(values));
  const [invalidUrl, setInvalidUrl] = useState(() => !toPropertySearchFilters(initialValues));
  const errors = invalidUrl ? validatePropertySearch(values) : validation.errors;

  const showNotice = (message: string) => toast(message, { id: "searchbar-filter-notice", duration: 4500 });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.validateForm(event.currentTarget)) return;
    const filters = toPropertySearchFilters(values);
    if (filters) {
      onSearch(filters);
    }
  };

  const clear = () => {
    if (!hasSearchCriteria) {
      showNotice("Agregá al menos un filtro antes de limpiar la búsqueda.");
      return;
    }
    setValues(createPropertySearchValues());
    setAlertStatus(null);
    setInvalidUrl(false);
    validation.resetValidation();
    onClear();
  };

  const hasSearchCriteria = [values.operationType, values.propertyType, values.province, values.city, values.provinceId, values.cityId, values.currency, values.minPrice, values.maxPrice].some((value) => value.trim() !== "");
  const alertFilters = toPropertySearchFilters(values);
  const canCreateAlert = Boolean(onCreateAlert && hasSearchCriteria && alertFilters && Object.keys(alertFilters).some((key) => key !== "sort" && key !== "page"));

  const createAlert = async () => {
    if (!hasSearchCriteria) {
      showNotice("Agregá al menos un filtro a la búsqueda para crear una alerta.");
      return;
    }
    if (!onCreateAlert) {
      showNotice("Iniciá sesión para crear una alerta con esta búsqueda.");
      return;
    }
    if (!alertFilters || !canCreateAlert) {
      showNotice("Revisá los filtros de la búsqueda antes de crear una alerta.");
      return;
    }
    if (creatingAlert) return;
    setCreatingAlert(true);
    setAlertStatus(null);
    try {
      await onCreateAlert(alertFilters);
      setAlertStatus("created");
    } catch {
      setAlertStatus("error");
    } finally {
      setCreatingAlert(false);
    }
  };

  const updateValues = (update: (previous: PropertySearchValues) => PropertySearchValues) => {
    setValues(update);
    setAlertStatus(null);
  };

  const fieldProps = (field: keyof PropertySearchValues) => ({
    ...validation.fieldProps(field),
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? validation.errorId(field) : undefined,
  });

  const selectField = (
    field: "operationType" | "propertyType", label: string, options: readonly (readonly [string, string])[], emptyLabel: string,
  ) => (
    <div className="min-w-0">
      <Label htmlFor={fieldProps(field).id} className="sr-only">{label}</Label>
      <Select value={values[field] || "all"} onValueChange={(selection) => {
        const value = selection === "all" ? "" : selection;
        updateValues((previous) => ({ ...previous, [field]: value }));
      }}>
        <SelectTrigger {...fieldProps(field)} className="h-12 w-full rounded-xl border-border bg-background px-3.5 text-foreground shadow-none data-[size=default]:h-12">
          <SelectValue placeholder={label}>{options.find(([value]) => value === values[field])?.[1] ?? label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{emptyLabel}</SelectItem>
          {options.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
        </SelectContent>
      </Select>
      <FieldError id={validation.errorId(field)}>{errors[field]}</FieldError>
    </div>
  );

  return (
    <form aria-label="Buscar propiedades" noValidate onSubmit={handleSearch} className="mx-auto mb-12 w-full rounded-2xl border border-border/80 bg-background p-4 shadow-[0_4px_20px_rgba(23,23,23,0.06)] sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] lg:grid-cols-[1.45fr_1fr_1fr_1fr_0.65fr_1fr_0.8fr] lg:gap-2">
        <PropertyLocationCombobox value={values}
          onChange={(location) => updateValues((previous) => ({ ...previous, ...location }))}
          onBlur={() => { validation.touch("provinceId"); validation.touch("cityId"); }}
          error={errors.provinceId ?? errors.cityId} />
        {selectField("operationType", "Categoría", Object.entries(OPERATION_TYPES), "Todas las categorías")}
        {selectField("propertyType", "Tipo de inmueble", Object.entries(PROPERTY_TYPES), "Todos los tipos")}
        <PropertyPriceFilter value={values}
          onChange={(price) => updateValues((previous) => ({ ...previous, ...price }))}
          error={errors.currency ?? errors.minPrice ?? errors.maxPrice} />
        <Button aria-label="Limpiar filtros" variant="outline" className="h-12 w-full min-w-0 rounded-xl border-border bg-background px-2 text-sm font-normal text-foreground shadow-none hover:bg-muted hover:text-foreground" type="button" onClick={clear}>Limpiar</Button>
        <Button aria-label={alertStatus === "created" ? "Alerta creada" : "Crear alerta con esta búsqueda"} variant="outline" className="h-12 w-full min-w-0 rounded-xl border-border bg-background px-2 text-sm font-normal text-foreground shadow-none hover:bg-muted hover:text-foreground" type="button" disabled={creatingAlert} onClick={() => void createAlert()}>
          {creatingAlert ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : alertStatus === "created" ? <Check className="size-4" aria-hidden="true" /> : <BellPlus className="size-4 shrink-0" aria-hidden="true" />}
          <span className="truncate">{creatingAlert ? "Guardando" : alertStatus === "created" ? "Creada" : alertStatus === "error" ? "Reintentar" : "Crear alerta"}</span>
        </Button>
        <Button className="h-12 w-full min-w-0 rounded-xl bg-primary px-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90" type="submit">
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" /> Buscar
        </Button>
        {alertStatus && <span className="sr-only" role={alertStatus === "error" ? "alert" : "status"}>{alertStatus === "created" ? "Alerta creada correctamente." : "No se pudo crear la alerta. Podés reintentar."}</span>}
      </div>
    </form>
  );
}
