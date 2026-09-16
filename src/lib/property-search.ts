import { CURRENCIES, OPERATION_TYPES } from "../constants/property.ts";
import { getPropertyCities, PROPERTY_LOCATIONS } from "../constants/locations.ts";
import type { PublicPropertySort, PublicPropertyType } from "../types/public-property.ts";
import type { PropertySearchErrors, PropertySearchFilters, PropertySearchValues } from "../types/property-search.ts";
import { isOptionKey, validateNumber } from "./validation.ts";

const SEARCH_PARAMS = { operationType: "operation", propertyType: "type", provinceId: "provinceId", cityId: "cityId", province: "province", city: "city", currency: "currency", minPrice: "minPrice", maxPrice: "maxPrice", sort: "sort", page: "page" } as const;
const PUBLIC_TYPES = new Set<PublicPropertyType>(["house", "apartment", "commercial"]);
const SORTS = new Set<PublicPropertySort>(["newest", "price_asc", "price_desc"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const searchPriceFormatter = new Intl.NumberFormat("en-US", { useGrouping: false, maximumSignificantDigits: 21 });

export function createPropertySearchValues(filters: PropertySearchFilters = {}): PropertySearchValues {
  return { operationType: filters.operationType ?? "", propertyType: filters.propertyType ?? "", provinceId: filters.provinceId ?? "", cityId: filters.cityId ?? "", province: filters.province ?? "", city: filters.city ?? "", currency: filters.currency ?? "", minPrice: filters.minPrice === undefined ? "" : searchPriceFormatter.format(filters.minPrice), maxPrice: filters.maxPrice === undefined ? "" : searchPriceFormatter.format(filters.maxPrice), sort: filters.sort ?? "newest", page: String(filters.page ?? 1) };
}

export function getPropertySearchCities(province: string): readonly string[] { return province ? getPropertyCities(province) : [...new Set(Object.values(PROPERTY_LOCATIONS).flat())]; }
export function changePropertySearchProvince(values: PropertySearchValues, province: string): PropertySearchValues { return { ...values, province, provinceId: "", city: getPropertyCities(province).includes(values.city) ? values.city : "", cityId: "" }; }

function readPrice(value: string): number | undefined { return value.trim() ? Number(value.trim().replace(",", ".")) : undefined; }
function validPage(value: string) { return /^\d+$/.test(value) && Number(value) >= 1; }

export function validatePropertySearch(values: PropertySearchValues): PropertySearchErrors {
  const errors: PropertySearchErrors = {};
  if (values.operationType && !isOptionKey(OPERATION_TYPES, values.operationType)) errors.operationType = "Seleccioná una categoría válida.";
  if (values.propertyType && !PUBLIC_TYPES.has(values.propertyType as PublicPropertyType)) errors.propertyType = "Seleccioná un tipo de inmueble válido.";
  if (values.provinceId && !UUID.test(values.provinceId)) errors.provinceId = "La provincia de la URL no es válida.";
  if (values.cityId && !UUID.test(values.cityId)) errors.cityId = "La localidad de la URL no es válida.";
  if (values.provinceId && values.cityId) errors.cityId = "Elegí una provincia o una localidad, no ambas.";
  if (!values.provinceId && values.province && !isOptionKey(PROPERTY_LOCATIONS, values.province)) errors.province = "Seleccioná una provincia válida.";
  if (!values.cityId && values.city && !getPropertySearchCities(values.province).includes(values.city)) errors.city = "Seleccioná una localidad válida.";
  if (values.currency && !CURRENCIES.some((currency) => currency === values.currency)) errors.currency = "Seleccioná una moneda válida.";
  for (const [field, label] of [["minPrice", "El precio mínimo"], ["maxPrice", "El precio máximo"]] as const) {
    const error = validateNumber(values[field], label, { optional: true }); if (error) errors[field] = error;
  }
  const minPrice = readPrice(values.minPrice); const maxPrice = readPrice(values.maxPrice);
  if (!errors.minPrice && !errors.maxPrice && minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) errors.maxPrice = "El precio máximo debe ser mayor o igual al mínimo.";
  if ((minPrice !== undefined || maxPrice !== undefined) && !values.currency) errors.currency = "Seleccioná una moneda para filtrar por precio.";
  if (values.sort && !SORTS.has(values.sort as PublicPropertySort)) errors.sort = "El orden de la URL no es válido.";
  if (!validPage(values.page)) errors.page = "La página de la URL no es válida.";
  return errors;
}

export function toPropertySearchFilters(values: PropertySearchValues): PropertySearchFilters | undefined {
  if (Object.values(validatePropertySearch(values)).some(Boolean)) return undefined;
  const filters: PropertySearchFilters = {};
  if (values.page !== "1") filters.page = Number(values.page);
  if (values.sort !== "newest") filters.sort = values.sort as PublicPropertySort;
  if (isOptionKey(OPERATION_TYPES, values.operationType)) filters.operationType = values.operationType;
  if (PUBLIC_TYPES.has(values.propertyType as PublicPropertyType)) filters.propertyType = values.propertyType as PublicPropertyType;
  if (values.provinceId) filters.provinceId = values.provinceId;
  if (values.cityId) filters.cityId = values.cityId;
  if (values.province) filters.province = values.province;
  if (values.city) filters.city = values.city;
  if (CURRENCIES.some((currency) => currency === values.currency)) filters.currency = values.currency as "ARS" | "USD";
  const minPrice = readPrice(values.minPrice); const maxPrice = readPrice(values.maxPrice);
  if (minPrice !== undefined) filters.minPrice = minPrice; if (maxPrice !== undefined) filters.maxPrice = maxPrice;
  return filters;
}

export function readPropertySearchValues(params: URLSearchParams): PropertySearchValues {
  const values = createPropertySearchValues();
  for (const field of Object.keys(SEARCH_PARAMS) as (keyof typeof SEARCH_PARAMS)[]) values[field] = params.get(SEARCH_PARAMS[field])?.trim() ?? values[field];
  return values;
}

export function parsePropertySearchParams(params: URLSearchParams): PropertySearchFilters | undefined { return toPropertySearchFilters(readPropertySearchValues(params)); }

export function serializePropertySearchFilters(filters: PropertySearchFilters, current = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(current);
  for (const field of Object.keys(SEARCH_PARAMS) as (keyof typeof SEARCH_PARAMS)[]) params.delete(SEARCH_PARAMS[field]);
  const values = createPropertySearchValues(filters);
  for (const field of Object.keys(SEARCH_PARAMS) as (keyof typeof SEARCH_PARAMS)[]) {
    const value = values[field];
    if (value && !(field === "sort" && value === "newest") && !(field === "page" && value === "1")) params.set(SEARCH_PARAMS[field], value);
  }
  return params;
}

export function resetPropertySearchPage(filters: PropertySearchFilters): PropertySearchFilters { return { ...filters, page: 1 }; }
