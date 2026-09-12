import { useState, type FormEvent, type ComponentProps } from "react";
import {
  CURRENCIES, OPERATION_TYPES, PROPERTY_TYPES, PROPERTY_CONDITIONS,
  PROPERTY_SERVICES, PROPERTY_AMENITIES,
} from "../constants/property";
import { PROPERTY_LOCATIONS, getPropertyCities } from "../constants/locations";
import { useFormValidation } from "../hooks/use-form-validation";
import { createPropertyFormValues, changePropertyProvince, toPropertyInput } from "../lib/property-form";
import { isOptionKey, validatePropertyForm } from "../lib/validation";
import type { Property } from "../types/property";
import type { PropertyFormSubmission, PropertyFormValues } from "../types/property-form";
import PropertyImages from "./PropertyImages";
import { Button } from "./ui/button";
import { InputField } from "./ui/input-field";
import { FieldError } from "./ui/field-error";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PropertyFormProps {
  /** Mount after loading; use the property ID as key when switching properties. */
  initialProperty?: Property;
  submitLabel: string;
  onSubmit: (input: PropertyFormSubmission) => void;
  onCancel: () => void;
}

function optionList<T extends Record<string, string>>(options: T) {
  return Object.keys(options)
    .filter((key): key is Extract<keyof T, string> => isOptionKey(options, key))
    .map((value) => ({ value, label: options[value] }));
}

type TextField = {
  [K in keyof PropertyFormValues]: string extends PropertyFormValues[K] ? K : never;
}[keyof PropertyFormValues];

export default function PropertyForm({ initialProperty, submitLabel, onSubmit, onCancel }: PropertyFormProps) {
  const [values, setValues] = useState(() => createPropertyFormValues(initialProperty));
  const [imageSelectionError, setImageSelectionError] = useState<string>();
  const { errors, fieldProps, errorId, validateForm, touch } = useFormValidation(() => {
    const errors = validatePropertyForm(values);
    return { ...errors, images: imageSelectionError ?? errors.images };
  });

  function updateField<K extends keyof PropertyFormValues>(field: K, value: PropertyFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function inputField(field: TextField, label: string, required = false, inputMode?: ComponentProps<"input">["inputMode"], placeholder?: string) {
    return (
      <InputField
        {...fieldProps(field)}
        label={label}
        required={required}
        aria-required={required}
        value={values[field]}
        onChange={(event) => updateField(field, event.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        error={errors[field]}
        errorId={errorId(field)}
      />
    );
  }

  function selectField<T extends string>(
    field: keyof PropertyFormValues,
    label: string,
    value: T | "",
    options: readonly { value: T; label: string }[],
    onChange: (value: T | "") => void,
    required = false,
    disabled = false,
  ) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldProps(field).id}>
          {label}{required && <span className="text-destructive">*</span>}
        </Label>
        <Select
          value={value || (required ? "" : "unspecified")}
          onValueChange={(selected) => {
            if (!required && selected === "unspecified") {
              onChange("");
            } else {
              const option = options.find((item) => item.value === selected);
              if (option) onChange(option.value);
            }
            touch(field);
          }}
          disabled={disabled}
        >
          <SelectTrigger {...fieldProps(field)} aria-required={required} className="bg-white w-full">
            <SelectValue placeholder="Seleccioná una opción" />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value="unspecified">No especificado</SelectItem>}
            {options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <FieldError id={errorId(field)}>{errors[field]}</FieldError>
      </div>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm(event.currentTarget)) return;
    const input = toPropertyInput(values);
    if (input) onSubmit(input);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          {inputField("title", "Título", true, undefined, "Ejemplo: Casa familiar con jardín")}
        </div>
        {selectField("province", "Provincia", values.province,
          Object.keys(PROPERTY_LOCATIONS).map((value) => ({ value, label: value })),
          (province) => setValues((previous) => changePropertyProvince(previous, province)), true)}
        {selectField("city", "Localidad", values.city,
          getPropertyCities(values.province).map((value) => ({ value, label: value })),
          (value) => updateField("city", value), true, !values.province)}
        {inputField("street", "Calle", false, undefined, "Ejemplo: Av. Libertador")}
        {inputField("number", "Altura", false, "numeric", "Ejemplo: 1234")}
        {selectField("propertyType", "Tipo de inmueble", values.propertyType, optionList(PROPERTY_TYPES),
          (value) => updateField("propertyType", value), true)}
        {selectField("operationType", "Tipo de operación", values.operationType, optionList(OPERATION_TYPES),
          (value) => updateField("operationType", value), true)}
        {inputField("price", "Precio", true, "decimal", "Ejemplo: 150000")}
        {selectField("currency", "Moneda", values.currency, CURRENCIES.map((value) => ({ value, label: value })),
          (value) => updateField("currency", value), true)}
        {inputField("totalArea", "Superficie total en m²", true, "decimal", "Ejemplo: 100")}
        {inputField("rooms", "Cantidad de ambientes", true, "numeric", "Ejemplo: 3")}
        {inputField("bedrooms", "Cantidad de dormitorios", false, "numeric")}
        {inputField("bathrooms", "Cantidad de baños", false, "numeric")}
        {inputField("garage", "Cantidad de cocheras", false, "numeric")}
        {inputField("age", "Antigüedad en años", false, "numeric")}
        {selectField("propertyCondition", "Estado del inmueble", values.propertyCondition, optionList(PROPERTY_CONDITIONS),
          (value) => updateField("propertyCondition", value))}
        {selectField("acceptsPets", "¿Acepta mascotas?", values.acceptsPets,
          [{ value: "yes", label: "Sí" }, { value: "no", label: "No" }],
          (value) => updateField("acceptsPets", value))}
        {inputField("expenses", `Expensas${values.currency ? ` (${values.currency})` : ""}`, false, "decimal")}
        {inputField("taxes", `Impuestos${values.currency ? ` (${values.currency})` : ""}`, false, "decimal")}
        {inputField("commissions", `Comisiones${values.currency ? ` (${values.currency})` : ""} — importe`, false, "decimal")}
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-3">Servicios disponibles</legend>
        <div className="flex flex-wrap gap-6">
          {optionList(PROPERTY_SERVICES).map(({ value, label }, index) => (
            <Label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                {...fieldProps("services")}
                id={`${fieldProps("services").id}-${index}`}
                type="checkbox"
                value={value}
                checked={values.services.includes(value)}
                onChange={(event) => updateField("services", event.target.checked
                  ? [...values.services, value] : values.services.filter((service) => service !== value))}
                className="h-4 w-4"
              />
              <span className="text-sm">{label}</span>
            </Label>
          ))}
        </div>
        <FieldError id={errorId("services")}>{errors.services}</FieldError>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-3">Comodidades</legend>
        <div className="flex flex-wrap gap-6">
          {optionList(PROPERTY_AMENITIES).map(({ value, label }, index) => (
            <Label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                {...fieldProps("amenities")}
                id={`${fieldProps("amenities").id}-${index}`}
                type="checkbox"
                value={value}
                checked={values.amenities.includes(value)}
                onChange={(event) => updateField("amenities", event.target.checked
                  ? [...values.amenities, value] : values.amenities.filter((amenity) => amenity !== value))}
                className="h-4 w-4"
              />
              <span className="text-sm">{label}</span>
            </Label>
          ))}
        </div>
        <FieldError id={errorId("amenities")}>{errors.amenities}</FieldError>
      </fieldset>

      <div>
        <Label htmlFor={fieldProps("description").id} className="block text-sm font-medium mb-1">
          Descripción <span className="text-destructive">*</span>
        </Label>
        <Textarea
          {...fieldProps("description")}
          required
          aria-required
          placeholder="Ejemplo: Hermosa casa ubicada en zona tranquila..."
          rows={5}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="bg-white"
        />
        <FieldError id={errorId("description")}>{errors.description}</FieldError>
      </div>

      <PropertyImages
        images={values.images}
        onChange={(images) => {
          updateField("images", images);
          setImageSelectionError(undefined);
          touch("images");
        }}
        onSelectionError={(error) => {
          setImageSelectionError(error);
          touch("images");
        }}
        fieldProps={fieldProps("images")}
        error={errors.images}
        errorId={errorId("images")}
      />

      <div className="flex justify-center gap-4 mt-6">
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
