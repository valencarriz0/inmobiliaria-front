import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
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
}

export default function SearchBar({ initialValues, onSearch, onClear }: SearchBarProps) {
  const [values, setValues] = useState(initialValues);
  const validation = useFormValidation(() => validatePropertySearch(values));
  const [invalidUrl, setInvalidUrl] = useState(() => !toPropertySearchFilters(initialValues));
  const errors = invalidUrl ? validatePropertySearch(values) : validation.errors;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.validateForm(event.currentTarget)) return;
    const filters = toPropertySearchFilters(values);
    if (filters) onSearch(filters);
  };

  const clear = () => {
    setValues(createPropertySearchValues());
    setInvalidUrl(false);
    validation.resetValidation();
    onClear();
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
        setValues((previous) => ({ ...previous, [field]: value }));
      }}>
        <SelectTrigger {...fieldProps(field)} className="h-12 w-full rounded-xl border-slate-200 bg-white px-3.5 text-foreground shadow-none data-[size=default]:h-12">
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
    <form aria-label="Buscar propiedades" noValidate onSubmit={handleSearch} className="mx-auto mb-12 max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:p-5 lg:p-6">
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] lg:grid-cols-[2.2fr_1.4fr_1.5fr_1.15fr_1.3fr]">
        <PropertyLocationCombobox value={values}
          onChange={(location) => setValues((previous) => ({ ...previous, ...location }))}
          onBlur={() => { validation.touch("province"); validation.touch("city"); }}
          error={errors.province ?? errors.city} />
        {selectField("operationType", "Categoría", Object.entries(OPERATION_TYPES), "Todas las categorías")}
        {selectField("propertyType", "Tipo de inmueble", Object.entries(PROPERTY_TYPES), "Todos los tipos")}
        <PropertyPriceFilter value={values}
          onChange={(price) => setValues((previous) => ({ ...previous, ...price }))}
          error={errors.currency ?? errors.minPrice ?? errors.maxPrice} />
        <div className="flex min-w-0 flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <Button className="h-12 w-full rounded-xl bg-accent px-3 font-semibold text-white hover:bg-accent/90" type="submit">
            <Search className="h-4 w-4" aria-hidden="true" /> Buscar
          </Button>
          <Button variant="outline" className="h-9 w-full rounded-xl border-slate-200 bg-white px-3 text-foreground shadow-none hover:bg-slate-50 hover:text-foreground" type="button" onClick={clear}>Limpiar filtros</Button>
        </div>
      </div>
    </form>
  );
}
