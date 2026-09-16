import type { Currency, OperationType } from "./property";
export interface Pagination { page: number; limit: number; total: number; totalPages: number; }
export interface AdminUser { id: string; firstName: string; lastName: string; email: string; phone: string | null; role: "interested" | "publisher"; accountStatus: "active" | "disabled"; createdAt: string; }
export interface AdminProperty { id: string; publisherId: string; title: string; operationType: OperationType; propertyType: string; price: number; currency: Currency; publicationStatus: "active" | "paused" | "deleted"; createdAt: string; images: string[]; location: { city?: string; province?: string }; }
export interface AdminMetrics { registeredUsers: number; publishers: number; activeProperties: number; pausedProperties: number; totalViews: number; totalConsultations: number; }
