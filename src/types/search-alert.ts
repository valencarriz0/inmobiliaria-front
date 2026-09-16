import type { Currency, OperationType } from "./property";
import type { PublicPropertyType } from "./public-property";
export interface SearchAlert { id: string; name: string | null; operationType: OperationType | null; propertyType: PublicPropertyType | null; provinceId: string | null; cityId: string | null; currency: Currency | null; minPrice: number | null; maxPrice: number | null; isActive: boolean; createdAt: string; province: { id: string; name: string } | null; city: { id: string; name: string } | null; }
export interface SearchAlertInput { name?: string | null; operationType?: OperationType | null; propertyType?: PublicPropertyType | null; provinceId?: string | null; cityId?: string | null; currency?: Currency | null; minPrice?: number | null; maxPrice?: number | null; }
