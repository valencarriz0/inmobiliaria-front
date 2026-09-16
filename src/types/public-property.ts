import type { Currency, OperationType, PropertyCondition, PropertyType } from "./property.ts";

export type PublicPropertyType = Exclude<PropertyType, "land">;
export type PublicPropertySort = "newest" | "price_asc" | "price_desc";

export interface PublicPropertyLocation {
  cityId?: string;
  city?: string;
  provinceId?: string;
  province?: string;
  street?: string;
  number?: string;
}

export interface PublicPropertySummary {
  id: string;
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: PublicPropertyType;
  price: number;
  currency: Currency;
  location: PublicPropertyLocation;
  totalArea: number;
  rooms: number;
  bedrooms?: number;
  bathrooms?: number;
  age?: number;
  propertyCondition?: PropertyCondition;
  acceptsPets?: boolean;
  garage?: number;
  expenses?: number;
  taxes?: number;
  commissions?: number;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  createdAt: string;
}

export interface PublicPropertyDetail extends PublicPropertySummary {
  services: string[];
  amenities: string[];
}

export interface PublicPropertyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicPropertyListResult {
  properties: PublicPropertySummary[];
  pagination: PublicPropertyPagination;
}

export interface PublicPropertyLocationDto {
  city: { id: string; name: string } | null;
  province: { id: string; name: string } | null;
}

export interface PublicPropertySummaryDto extends PublicPropertyLocationDto {
  id: string;
  title: string;
  description: string;
  operationType: string;
  propertyType: string;
  price: string | number;
  currency: string;
  street: string | null;
  streetNumber: string | null;
  totalArea: string | number;
  rooms: string | number;
  bedrooms: string | number | null;
  bathrooms: string | number | null;
  age: string | number | null;
  propertyCondition: string | null;
  acceptsPets: boolean | null;
  garage: string | number | null;
  expenses: string | number | null;
  taxes: string | number | null;
  commissions: string | number | null;
  latitude: string | number | null;
  longitude: string | number | null;
  images: string[];
  createdAt: string;
}

export interface PublicPropertyDetailDto extends PublicPropertySummaryDto {
  services: { id: string; code: string; name: string }[];
  amenities: { id: string; code: string; name: string }[];
}

export interface PublicPropertyListResponseDto {
  properties: PublicPropertySummaryDto[];
  pagination: PublicPropertyPagination;
}

export interface PublicPropertyDetailResponseDto { property: PublicPropertyDetailDto; }

export interface PropertyViewHistoryItemDto {
  property: PublicPropertyDetailDto;
  lastViewedAt: string;
}

export interface PropertyViewHistoryResponseDto {
  history: PropertyViewHistoryItemDto[];
  pagination: PublicPropertyPagination;
}

export interface PropertyViewHistoryItem {
  property: PublicPropertyDetail;
  lastViewedAt: string;
}
