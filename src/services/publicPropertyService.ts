import { apiRequest } from "./api.ts";
import { mapPublicPropertyDetail, mapPublicPropertySummary } from "../lib/public-property.ts";
import type { PublicPropertyDetail, PublicPropertyDetailResponseDto, PublicPropertyListResponseDto, PublicPropertyListResult, PublicPropertyPagination, PublicPropertySort } from "../types/public-property.ts";
import type { PropertySearchFilters } from "../types/property-search.ts";

function queryParams(filters: PropertySearchFilters) {
  const params = new URLSearchParams();
  const filtersWithoutLabels = Object.fromEntries(Object.entries(filters).filter(([key]) => key !== "province" && key !== "city"));
  const values = { ...filtersWithoutLabels, limit: filters.limit ?? 12, page: filters.page ?? 1, sort: filters.sort ?? "newest" };
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) params.set(key, String(value));
  }
  return params;
}

function validPagination(value: unknown): PublicPropertyPagination {
  if (!value || typeof value !== "object") throw new Error("Respuesta de catálogo inválida.");
  const pagination = value as PublicPropertyPagination;
  if (![pagination.page, pagination.limit, pagination.total, pagination.totalPages].every((number) => Number.isSafeInteger(number) && number >= 0)) {
    throw new Error("Respuesta de catálogo inválida.");
  }
  return pagination;
}

export async function getPublicProperties(filters: PropertySearchFilters = {}, signal?: AbortSignal): Promise<PublicPropertyListResult> {
  const params = queryParams(filters);
  const response = await apiRequest<PublicPropertyListResponseDto>(`/properties?${params}`, { signal });
  if (!Array.isArray(response.properties)) throw new Error("Respuesta de catálogo inválida.");
  return { properties: response.properties.map(mapPublicPropertySummary), pagination: validPagination(response.pagination) };
}

export async function getPublicPropertyById(id: string, signal?: AbortSignal): Promise<PublicPropertyDetail> {
  const response = await apiRequest<PublicPropertyDetailResponseDto>(`/properties/${encodeURIComponent(id)}`, { signal });
  return mapPublicPropertyDetail(response.property);
}

export const PUBLIC_PROPERTY_SORTS: readonly PublicPropertySort[] = ["newest", "price_asc", "price_desc"];
