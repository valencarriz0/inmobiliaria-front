import { CURRENCIES, OPERATION_TYPES, PROPERTY_TYPES } from "../constants/property.ts";
import { getPropertyCities, PROPERTY_LOCATIONS } from "../constants/locations.ts";
import type { PropertySearchErrors, PropertySearchFilters, PropertySearchValues } from "../types/property-search.ts";
import { isOptionKey, validateNumber } from "./validation.ts";

const SEARCH_PARAMS = {
  operationType: "operation",
  propertyType: "type",
  province: "province",
  city: "city",
  currency: "currency",
  minPrice: "minPrice",
  maxPrice: "maxPrice",
} as const;

// Keep numeric round trips in plain decimal notation, even for very small bounds.
const searchPriceFormatter = new Intl.NumberFormat("en-US", { useGrouping: false, maximumSignificantDigits: 21 });

export function createPropertySearchValues(filters: PropertySearchFilters = {}): PropertySearchValues {
  return {
    operationType: filters.operationType ?? "",
    propertyType: filters.propertyType ?? "",
    province: filters.province ?? "",
    city: filters.city ?? "",
    currency: filters.currency ?? "",
    minPrice: filters.minPrice === undefined ? "" : searchPriceFormatter.format(filters.minPrice),
    maxPrice: filters.maxPrice === undefined ? "" : searchPriceFormatter.format(filters.maxPrice),
  };
}

export function getPropertySearchCities(province: string): readonly string[] {
  return province ? getPropertyCities(province) : [...new Set(Object.values(PROPERTY_LOCATIONS).flat())];
}

export function changePropertySearchProvince(values: PropertySearchValues, province: string): PropertySearchValues {
  return { ...values, province, city: getPropertyCities(province).includes(values.city) ? values.city : "" };
}

function readPrice(value: string): number | undefined {
  return value.trim() ? Number(value.trim().replace(",", ".")) : undefined;
}

export function validatePropertySearch(values: PropertySearchValues): PropertySearchErrors {
  const errors: PropertySearchErrors = {};
  if (values.operationType && !isOptionKey(OPERATION_TYPES, values.operationType)) errors.operationType = "Seleccioná una categoría válida.";
  if (values.propertyType && !isOptionKey(PROPERTY_TYPES, values.propertyType)) errors.propertyType = "Seleccioná un tipo de inmueble válido.";
  if (values.province && !isOptionKey(PROPERTY_LOCATIONS, values.province)) errors.province = "Seleccioná una provincia del catálogo.";
  if (values.city && !getPropertySearchCities(values.province).includes(values.city)) errors.city = "Seleccioná una localidad de la provincia elegida.";
  if (values.currency && !CURRENCIES.some((currency) => currency === values.currency)) errors.currency = "Seleccioná una moneda válida.";

  for (const [field, label] of [["minPrice", "El precio mínimo"], ["maxPrice", "El precio máximo"]] as const) {
    const error = validateNumber(values[field], label, { optional: true });
    if (error) errors[field] = error;
  }
  const minPrice = readPrice(values.minPrice);
  const maxPrice = readPrice(values.maxPrice);
  if (!errors.minPrice && !errors.maxPrice && minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    errors.maxPrice = "El precio máximo debe ser mayor o igual al mínimo.";
  }
  if ((minPrice !== undefined || maxPrice !== undefined) && !values.currency) {
    errors.currency = "Seleccioná una moneda para filtrar por precio.";
  }
  return errors;
}

export function toPropertySearchFilters(values: PropertySearchValues): PropertySearchFilters | undefined {
  if (Object.values(validatePropertySearch(values)).some(Boolean)) return undefined;
  const filters: PropertySearchFilters = {};
  if (isOptionKey(OPERATION_TYPES, values.operationType)) filters.operationType = values.operationType;
  if (isOptionKey(PROPERTY_TYPES, values.propertyType)) filters.propertyType = values.propertyType;
  const currency = CURRENCIES.find((currency) => currency === values.currency);
  if (currency) filters.currency = currency;
  if (values.province) filters.province = values.province;
  if (values.city) filters.city = values.city;
  const minPrice = readPrice(values.minPrice);
  const maxPrice = readPrice(values.maxPrice);
  if (minPrice !== undefined) filters.minPrice = minPrice;
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;
  return filters;
}

export function readPropertySearchValues(params: URLSearchParams): PropertySearchValues {
  const values = createPropertySearchValues();
  for (const field of Object.keys(SEARCH_PARAMS)) {
    if (isOptionKey(SEARCH_PARAMS, field)) values[field] = params.get(SEARCH_PARAMS[field])?.trim() ?? "";
  }
  return values;
}

// Invalid URLs return a controlled state. Keep their text so the user can correct it.
export function parsePropertySearchParams(params: URLSearchParams): PropertySearchFilters | undefined {
  return toPropertySearchFilters(readPropertySearchValues(params));
}

export function serializePropertySearchFilters(filters: PropertySearchFilters, current = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const field of Object.keys(SEARCH_PARAMS)) {
    if (!isOptionKey(SEARCH_PARAMS, field)) continue;
    params.delete(SEARCH_PARAMS[field]);
    const value = filters[field];
    if (value !== undefined && value !== "") {
      params.set(SEARCH_PARAMS[field], typeof value === "number" ? searchPriceFormatter.format(value) : value);
    }
  }
  return params;
}
