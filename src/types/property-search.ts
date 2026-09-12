import type { Currency, OperationType, PropertyType } from "./property.ts";

export interface PropertySearchFilters {
  operationType?: OperationType;
  propertyType?: PropertyType;
  province?: string;
  city?: string;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
}

// Editable text stays in the form; confirmed filters contain numeric prices.
export type PropertySearchValues = { [Field in keyof Required<PropertySearchFilters>]: string };
export type PropertySearchErrors = Partial<Record<keyof PropertySearchFilters, string>>;
