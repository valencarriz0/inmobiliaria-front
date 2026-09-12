import type {
  CURRENCIES,
  OPERATION_TYPES,
  PROPERTY_AMENITIES,
  PROPERTY_SERVICES,
  PROPERTY_TYPES,
  PUBLICATION_STATUSES,
} from "../constants/property.ts";

export type OperationType = keyof typeof OPERATION_TYPES;
export type PropertyType = keyof typeof PROPERTY_TYPES;
export type Currency = (typeof CURRENCIES)[number];
export type PublicationStatus = keyof typeof PUBLICATION_STATUSES;
export type PropertyCondition = "new" | "excellent" | "good" | "to-renovate";
export type PropertyService = keyof typeof PROPERTY_SERVICES;
export type PropertyAmenity = keyof typeof PROPERTY_AMENITIES;

export interface PropertyLocation {
  country: string;
  province: string;
  city: string;
  street?: string;
  number?: string;
}

export interface Property {
  readonly id: number;
  title: string;
  description: string;
  operationType: OperationType;
  propertyType: PropertyType;
  price: number;
  currency: Currency;
  location: PropertyLocation;
  /** m². Null means the legacy example did not provide this information. */
  totalArea: number | null;
  /** Total rooms, distinct from bedrooms. Null means not reported. */
  rooms: number | null;
  bedrooms?: number;
  bathrooms?: number;
  /** Years. */
  age?: number;
  propertyCondition?: PropertyCondition;
  services: PropertyService[];
  amenities: PropertyAmenity[];
  acceptsPets?: boolean;
  /** Number of parking spaces. */
  garage?: number;
  /** Monetary amounts in the property's currency; commissions are not percentages. */
  expenses?: number;
  taxes?: number;
  commissions?: number;
  /** Image URLs in display order; the first is the cover. */
  images: string[];
  publisherId: number;
  publicationStatus: PublicationStatus;
  latitude?: number;
  longitude?: number;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}
