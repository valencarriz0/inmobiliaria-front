import type { Currency, OperationType } from "./property.ts";
import type { PublicPropertySort, PublicPropertyType } from "./public-property.ts";

export interface PropertySearchFilters {
  operationType?: OperationType;
  propertyType?: PublicPropertyType;
  provinceId?: string;
  cityId?: string;
  province?: string;
  city?: string;
  currency?: Currency;
  minPrice?: number;
  maxPrice?: number;
  sort?: PublicPropertySort;
  page?: number;
  limit?: number;
}

// Editable text stays in the form; confirmed filters contain numeric prices.
export interface PropertySearchValues {
  operationType: string;
  propertyType: string;
  provinceId: string;
  cityId: string;
  province: string;
  city: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  page: string;
}
export type PropertySearchErrors = Partial<Record<keyof PropertySearchFilters, string>>;
