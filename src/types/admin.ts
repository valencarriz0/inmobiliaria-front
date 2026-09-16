import type { Currency, OperationType, PropertyAmenity, PropertyCondition, PropertyService } from "./property";
import type { PublisherPropertyDto, PropertyHistoryEntry } from "./publisher-property";
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface AdminUser { id: string; firstName: string; lastName: string; email: string; phone: string | null; role: "interested" | "publisher"; accountStatus: "active" | "disabled"; createdAt: string; }
export interface AdminProperty extends PublisherPropertyDto { publisherId: string; operationType: OperationType; currency: Currency; publicationStatus: "active" | "paused" | "deleted"; }
export interface AdminPropertyUpdate {
  title?: string;
  description?: string;
  operationType?: OperationType;
  propertyType?: "house" | "apartment" | "commercial";
  price?: number | string;
  currency?: Currency;
  cityId?: string;
  street?: string | null;
  streetNumber?: string | null;
  totalArea?: number;
  rooms?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  age?: number | null;
  propertyCondition?: PropertyCondition | null;
  acceptsPets?: boolean | null;
  garage?: number | null;
  expenses?: number | null;
  taxes?: number | null;
  commissions?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceCodes?: PropertyService[];
  amenityCodes?: PropertyAmenity[];
}
export type { PropertyHistoryEntry };
export interface AdminMetrics { registeredUsers: number; publishers: number; activeProperties: number; pausedProperties: number; totalViews: number; totalConsultations: number; }
