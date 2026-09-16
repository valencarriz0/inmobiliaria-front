import type { Property } from "./property.ts";
import type { PublicPropertyDetailDto } from "./public-property.ts";

export type PublisherProperty = Omit<Property, "publisherId">;
export interface PublisherPropertyDto extends PublicPropertyDetailDto {
	country?: string | null;
	publicationStatus: string;
	updatedAt: string;
}
export type PropertyHistoryValue = string | number | boolean | null | string[];
export type PropertyHistoryData = Record<string, PropertyHistoryValue>;
export type PropertyHistoryEntry = { id: string; action: "created" | "updated" | "paused" | "reactivated" | "deleted"; createdAt: string; previousData: PropertyHistoryData | null; newData: PropertyHistoryData | null };
